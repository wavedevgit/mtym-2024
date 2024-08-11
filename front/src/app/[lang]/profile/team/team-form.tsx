"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/shared"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shared/form"
import { Input } from "@/components/shared"
import { toast } from "@/components/hooks/use-toast"
import { updateUser } from "@/api/UsersApi"
import ProfileSkeleton from "../profile-skeleton"
import { useRecoilState } from "recoil"
import { userState } from "@/store/userState"
import { useAuthGuard } from "@/components/hooks/use-auth-guard"

const profileFormSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string({ required_error: "Please select an email to display." }).email(),
})

type TeamFormValues = z.infer<typeof profileFormSchema>

// This can come from your database or API.
const defaultValues: Partial<TeamFormValues> = {
  firstName: '',
  lastName: '',
  email: '',
}

export function TeamForm() {
  const [userData, setUserData] = useRecoilState(userState);
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
    values: userData,
  })

  const onSubmit = async (formData: TeamFormValues) => {
    const userId = userData?.id;
    const response = await updateUser(userId, formData) as any;
    
    if (response?.statusCode === 200) {
      setUserData({...userData, firstName: formData?.firstName, lastName: formData?.lastName});
      toast({
        title: "You submitted a profile update",
        description: "Your modifications were taken into account",
      })
    } else {
      toast({
        title: "You submitted a profile update",
        description: "We've had a server error. Please try later",
        variant: 'destructive',
      })
    }
  }

  useAuthGuard();

  if (!userData) return <ProfileSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="First Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Last Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}
