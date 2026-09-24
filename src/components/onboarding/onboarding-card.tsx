import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { OnboardingForm } from './onboarding-form'

export function OnboardingCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Welcome to HAUZ</CardTitle>
        <CardDescription>
          Tell us a little about yourself to finish setting up your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm />
      </CardContent>
    </Card>
  )
}
