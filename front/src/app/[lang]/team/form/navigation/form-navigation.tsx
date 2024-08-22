import { Dispatch, SetStateAction } from "react"
import { steps } from "../steps"
import { Button } from "@/components/shared"
import { UseFormReturn } from "react-hook-form"

export const FormNavigation = ({
  variant = "arrows",
  form,
  formType,
  currentStep,
  setPreviousStep,
  setCurrentStep,
  setFormType,
}:{
  variant?: 'arrows' | 'button',
  form?: UseFormReturn<any>,
  formType: string,
  currentStep: number,
  setPreviousStep: Dispatch<SetStateAction<number>>,
  setCurrentStep: Dispatch<SetStateAction<number>>,
  setFormType: Dispatch<SetStateAction<string>>,
}) => {
  const next = async () => {
    const fields = steps[currentStep].getFields(formType)
    const output = await form?.trigger(fields, { shouldFocus: true })
    if (!output) return

    if (currentStep < steps.length - 1) {
      setPreviousStep(currentStep)
      setCurrentStep(step => step + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep)
      setCurrentStep(step => step - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }

    if (currentStep === 1) {
      form?.reset()
      setFormType('')
    }
  }

  const arrowsTemplate =  (
    <div className='mt-8 pt-5'>
      <div className='flex justify-between'>
        <button
          type='button'
          onClick={prev}
          disabled={currentStep === 0}
          className='rounded bg-white px-2 py-1 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.75 19.5L8.25 12l7.5-7.5'
            />
          </svg>
        </button>
        <button
          type='button'
          onClick={next}
          disabled={currentStep === steps.length - 1}
          className='rounded bg-white px-2 py-1 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.25 4.5l7.5 7.5-7.5 7.5'
            />
          </svg>
        </button>
      </div>
    </div>
  )

  const buttonTemplate = (
    <div className='mt-12 pt-5 flex flex-row space-x-8 justify-center'>
      <Button className="w-[8rem] bg-gray-600" onClick={prev} disabled={currentStep === 0}>Previous Step</Button>
      <Button className="w-[8rem] bg-[#0284C7]" onClick={next} disabled={currentStep === steps.length - 1}>Next Step</Button>
    </div>
  )

  if (!form) return;
  if (variant == 'arrows') return arrowsTemplate
  else return buttonTemplate
}