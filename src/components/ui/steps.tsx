import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type StepStatus = "upcoming" | "current" | "complete"

interface Step {
  title: string
  description: string
  status: StepStatus
}

interface StepsProps {
  steps: Step[]
}

export function Steps({ steps }: StepsProps) {
  return (
    <div className="relative hidden sm:block">
      {/* Vertical Progress Bar */}
      <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-gray-200">
        <div
          className="absolute w-full bg-blue-500 transition-all duration-500"
          style={{
            height: `${
              ((steps.filter(step => step.status === "complete").length) /
                (steps.length - 1)) *
              100
            }%`,
          }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex flex-col space-y-8">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex items-start space-x-4"
          >
            {/* Step Circle */}
            <div
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center bg-white",
                {
                  "border-gray-300": step.status === "upcoming",
                  "border-blue-500": step.status === "current",
                  "border-green-500 bg-green-500": step.status === "complete",
                }
              )}
            >
              {step.status === "complete" ? (
                <CheckIcon className="w-6 h-6 text-white" />
              ) : (
                <span
                  className={cn("text-sm font-semibold", {
                    "text-gray-500": step.status === "upcoming",
                    "text-blue-500": step.status === "current",
                  })}
                >
                  {index + 1}
                </span>
              )}
            </div>

            {/* Step Title & Description */}
            <div className="pt-1">
              <div
                className={cn("font-semibold", {
                  "text-gray-500": step.status === "upcoming",
                  "text-blue-500": step.status === "current",
                  "text-green-500": step.status === "complete",
                })}
              >
                {step.title}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 