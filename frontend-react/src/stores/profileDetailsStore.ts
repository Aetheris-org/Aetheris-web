import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PreferredContactMethod = 'email' | 'direct-message' | 'schedule' | 'social' | 'not-specified'

export interface ProfileDetails {
  headline: string
  availability: string
  currentRole: string
  currentCompany: string
  yearsExperience: string
  timezone: string
  pronouns: string
  contactEmail: string
  website: string
  location: string
  languages: string
  focusAreas: string
  currentlyLearning: string
  openToMentoring: boolean
  openToConsulting: boolean
  openToSpeaking: boolean
  preferredContactMethod: PreferredContactMethod
  newsletterName: string
  newsletterUrl: string
  officeHours: string
  collaborationNotes: string
  social: {
    twitter: string
    github: string
    linkedin: string
    portfolio: string
  }
}

export const defaultProfileDetails: ProfileDetails = {
  headline: '',
  availability: '',
  currentRole: '',
  currentCompany: '',
  yearsExperience: '',
  timezone: '',
  pronouns: '',
  contactEmail: '',
  website: '',
  location: '',
  languages: '',
  focusAreas: '',
  currentlyLearning: '',
  openToMentoring: false,
  openToConsulting: false,
  openToSpeaking: false,
  preferredContactMethod: 'not-specified',
  newsletterName: '',
  newsletterUrl: '',
  officeHours: '',
  collaborationNotes: '',
  social: {
    twitter: '',
    github: '',
    linkedin: '',
    portfolio: '',
  },
}

type ProfileDetailsState = {
  details: ProfileDetails
  setDetails: (updates: PartialProfileDetails) => void
  reset: () => void
}

type PartialProfileDetails = Partial<Omit<ProfileDetails, 'social'>> & {
  social?: Partial<ProfileDetails['social']>
}

export const useProfileDetailsStore = create<ProfileDetailsState>()(
  persist(
    (set) => ({
      details: defaultProfileDetails,
      setDetails: (updates) =>
        set((state) => ({
          details: {
            ...state.details,
            ...updates,
            social: {
              ...state.details.social,
              ...updates.social,
            },
          },
        })),
      reset: () => set({ details: defaultProfileDetails }),
    }),
    {
      name: 'aetheris-profile-details',
      version: 1,
    }
  )
)
