"use client"

import { useState } from "react"
import { FormSteps } from "./header/form-steps"
import { FormNavigation } from "./navigation/form-navigation"
import { PersonalInformationStep, EducationStep, CompetitionStep, UploadStep, ValidationStep } from "./steps"
import { useForm } from "react-hook-form"
import { applicationSchema, getApplicationDefaultValues } from "@/lib/schemas/application.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { computeSHA256, excludeFileFields, generateFileName, getUploadFolderName, sanitizeApplication } from "@/lib/utils"
import { z } from "zod"
import { Form } from "@/components/shared/form"
import { Button, Separator } from "@/components/shared"
import { toast } from "@/components/hooks/use-toast";
import { postApplication, putApplication, updateApplicationStatus } from "@/api/ApplicationApi"
import { useRouter } from "next/navigation"
import { getSignedURL, uploadFile } from "@/api/MediaApi"
import { LoadingDots } from "@/components/shared/icons"

export const ApplicationForm = ({ 
  userData,
}: {
  userData: any,
}) => {
  const [previousStep, setPreviousStep] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [isFormLoading, setIsFormLoading] = useState(false);
  const router = useRouter()
  const delta = currentStep - previousStep
  const form = useForm<z.infer<typeof applicationSchema>>({
    resolver: zodResolver(applicationSchema),
    defaultValues: userData?.application 
      ? {...sanitizeApplication(userData?.application), firstName: userData?.firstName, lastName: userData?.lastName} 
      : getApplicationDefaultValues(userData),
    mode: "onChange",
  })

  const onSubmit = async (formData: z.infer<typeof applicationSchema>) => {
    setIsFormLoading(true);
    const { cnie, schoolCertificate, grades, regulations, parentalAuthorization } = formData;
    const uploadFolderName = getUploadFolderName(userData.firstName, userData.lastName);
    const uploadFileNames = ['cnie', 'school_certificate', 'grades', 'regulations', 'parental_authorization']
      .map(name => `${name}_${generateFileName()}`)
    const files = [cnie, schoolCertificate, grades, regulations, parentalAuthorization]
      .map((files, index) => new File(
        [files[0]], 
        uploadFileNames[index] + '.' + files[0].name.split('.').pop(),
        { type: files[0].type },
      ))
    
    try {
      // Post application
      const applicationResponse = userData?.application
        ? await putApplication(userData?.application?.id, excludeFileFields(formData)) as any
        : await postApplication({userId: userData.id, ...formData}) as any
      ;

      if (applicationResponse?.statusCode !== 200) {
        throw new Error('Post of application failed')
      }

      const applicationId = applicationResponse?.id;

      // Upload files
      for (const file of files) {
        const checksum = await computeSHA256(file);

        const signedURLResponse = await getSignedURL(`upload_mtym/${uploadFolderName}/${file.name}`, file.type, file.size, checksum) as any;
        if (signedURLResponse?.statusCode !== 200) {
          throw new Error('Get of application signed URL failed');
        }

        const uploadResponse = await uploadFile(signedURLResponse?.url, file) as any;
        if (uploadResponse?.statusCode !== 200) {
          throw new Error('Upload of file failed');
        }
      }

      // Update Application upload links
      const putApplicationResponse = await putApplication(applicationId, {
        cnieUrl: `upload_mtym/${uploadFolderName}/${files[0].name}`,
        schoolCertificateUrl: `upload_mtym/${uploadFolderName}/${files[1].name}`,
        gradesUrl: `upload_mtym/${uploadFolderName}/${files[2].name}`,
        regulationsUrl: `upload_mtym/${uploadFolderName}/${files[3].name}`,
        parentalAuthorizationUrl: `upload_mtym/${uploadFolderName}/${files[4].name}`,
      }) as any
      if (putApplicationResponse?.affected === 0) {
        throw new Error('Put of application failed');
      }

      // Update Application status
      const updateApplicationStatusResponse = await updateApplicationStatus(applicationId, { status: 'PENDING' }) as any;

      toast({
        title: 'Application created with success',
        description: 'You can access your current application in your profile page',
      });

      router.push('/profile/application')
      setTimeout(() => {
        window.location.reload();
      }, 500)
    } catch(err: any) {
      toast({
        title: 'Application submission failed',
        description: err?.message,
        variant: 'destructive'
      });
    } finally {
      setIsFormLoading(false);
    }
  }

  const onSave = async () => {
    const application = form.watch()

    try {
      const applicationResponse = userData?.application
        ? await putApplication(application?.id, excludeFileFields(application)) as any
        : await postApplication({userId: userData.id, ...application}) as any
      ;

      if (applicationResponse?.statusCode !== 200) {
        throw new Error('Post of application failed')
      }

      toast({
        title: 'Application saved successfully',
        description: 'You can access your current application in your profile page',
      });
      
      router.push('/profile/application')
      setTimeout(() => {
        window.location.reload();
      }, 1000)
    } catch(err: any) {
      toast({
        title: 'Application submission failed',
        description: err?.message,
        variant: 'destructive'
      });
    }    
  }

  const onError = async (errors: any) => {
    toast({
      title: "The form is invalid",
      description: "Not all required fields have been filled in.",
      variant: 'destructive',
    })
  }

  return (
    <section className='w-full inset-0 flex flex-col justify-between mt-6'>
      {/* Header */}
      <div className="flex justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Candidature</h2>
          <div className="text-muted-foreground">
            Suivez les étapes ci-dessous pour compléter votre candidature
          </div>
        </div>

        <div>
          <Button onClick={onSave}>Sauvegarder & Terminer plus tard</Button>
        </div>
      </div>
        
      <Separator className="my-6" />

      {/* Steps */}
      <FormSteps currentStep={currentStep} />

      {/* Navigation */}
      <FormNavigation
        currentStep={currentStep}
        form={form}
        setPreviousStep={setPreviousStep} 
        setCurrentStep={setCurrentStep} 
      />

      {/* Form */}
      <Form {...form}>
        <form className='mt-6' onSubmit={form.handleSubmit(onSubmit, onError)}>
          {/* Personal informations */}
          {currentStep === 0 && (
            <PersonalInformationStep form={form} delta={delta} />
          )}

          {currentStep === 1 && (
            <EducationStep form={form} delta={delta} />
          )}

          {currentStep === 2 && (
            <CompetitionStep form={form} delta={delta} />
          )}

          {currentStep === 3 && (
            <UploadStep form={form} delta={delta} />
          )}

          {currentStep === 4 && (
            <ValidationStep form={form} delta={delta} />
          )}

          {/* Submit Button */}
          {currentStep === 4 && (
            <div className='mt-20 text-center'> 
              <Button type="submit">
                {isFormLoading ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <div>Submit Application</div>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
      
      

      {/* Navigation */}
      <FormNavigation
        variant="button"
        form={form}
        currentStep={currentStep} 
        setPreviousStep={setPreviousStep} 
        setCurrentStep={setCurrentStep} 
      />
    </section>
  )
}