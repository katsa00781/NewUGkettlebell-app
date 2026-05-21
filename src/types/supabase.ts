export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          instructions: string | null
          category: Database['public']['Enums']['exercise_category']
          movement_pattern: Database['public']['Enums']['movement_pattern']
          difficulty: number
          image_url: string | null
          video_url: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          instructions?: string | null
          category: Database['public']['Enums']['exercise_category']
          movement_pattern: Database['public']['Enums']['movement_pattern']
          difficulty: number
          image_url?: string | null
          video_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          instructions?: string | null
          category?: Database['public']['Enums']['exercise_category']
          movement_pattern?: Database['public']['Enums']['movement_pattern']
          difficulty?: number
          image_url?: string | null
          video_url?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          is_active?: boolean
        }
        Relationships: []
      }
      exercise_taxonomy_assignments: {
        Row: {
          exercise_id: string
          exercise_taxonomy_tag_id: string
          source: Database['public']['Enums']['exercise_taxonomy_assignment_source']
          is_primary: boolean
          created_at: string
        }
        Insert: {
          exercise_id: string
          exercise_taxonomy_tag_id: string
          source?: Database['public']['Enums']['exercise_taxonomy_assignment_source']
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          exercise_id?: string
          exercise_taxonomy_tag_id?: string
          source?: Database['public']['Enums']['exercise_taxonomy_assignment_source']
          is_primary?: boolean
          created_at?: string
        }
        Relationships: []
      }
      exercise_taxonomy_tags: {
        Row: {
          id: string
          slug: string
          label: string
          dimension: Database['public']['Enums']['exercise_taxonomy_dimension']
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          label: string
          dimension: Database['public']['Enums']['exercise_taxonomy_dimension']
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          label?: string
          dimension?: Database['public']['Enums']['exercise_taxonomy_dimension']
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          full_name: string | null
          display_name: string | null
          role: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          height: number | null
          weight: number | null
          birthdate: string | null
          gender: string | null
          fitness_goals: string[] | null
          experience_level: string | null
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          display_name?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          height?: number | null
          weight?: number | null
          birthdate?: string | null
          gender?: string | null
          fitness_goals?: string[] | null
          experience_level?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          display_name?: string | null
          role?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          height?: number | null
          weight?: number | null
          birthdate?: string | null
          gender?: string | null
          fitness_goals?: string[] | null
          experience_level?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string
          max_participants: number
          current_participants: number
          created_by: string
          is_cancelled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time: string
          max_participants: number
          current_participants?: number
          created_by: string
          is_cancelled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string
          max_participants?: number
          current_participants?: number
          created_by?: string
          is_cancelled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments_participants: {
        Row: {
          appointment_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          appointment_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          appointment_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: []
      }
      appointment_bookings: {
        Row: {
          id: string
          appointment_id: string
          user_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          user_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          user_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          title: string
          date: string
          duration: number
          notes: string | null
          sections: Json
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          date: string
          duration: number
          notes?: string | null
          sections: Json
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          date?: string
          duration?: number
          notes?: string | null
          sections?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fms_assessments: {
        Row: {
          id: string
          user_id: string
          date: string
          deep_squat: number
          hurdle_step: number
          inline_lunge: number
          shoulder_mobility: number
          active_straight_leg_raise: number
          trunk_stability_pushup: number
          rotary_stability: number
          total_score: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          deep_squat: number
          hurdle_step: number
          inline_lunge: number
          shoulder_mobility: number
          active_straight_leg_raise: number
          trunk_stability_pushup: number
          rotary_stability: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          deep_squat?: number
          hurdle_step?: number
          inline_lunge?: number
          shoulder_mobility?: number
          active_straight_leg_raise?: number
          trunk_stability_pushup?: number
          rotary_stability?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_weights: {
        Row: {
          id: string
          user_id: string
          weight: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          body_fat_pct: number | null
          muscle_mass_kg: number | null
          visceral_fat: number | null
          bmi: number | null
          body_water_pct: number | null
          bone_mass_kg: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          body_fat_pct?: number | null
          muscle_mass_kg?: number | null
          visceral_fat?: number | null
          bmi?: number | null
          body_water_pct?: number | null
          bone_mass_kg?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          body_fat_pct?: number | null
          muscle_mass_kg?: number | null
          visceral_fat?: number | null
          bmi?: number | null
          body_water_pct?: number | null
          bone_mass_kg?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      kb_complexes: {
        Row: {
          id: string
          user_id: string
          exercises: Json
          rounds: number
          rest_period_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercises?: Json
          rounds?: number
          rest_period_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercises?: Json
          rounds?: number
          rest_period_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_guests: {
        Row: {
          id: string
          owner_id: string
          guest_name: string
          fms_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          guest_name: string
          fms_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          guest_name?: string
          fms_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exercise_category:
        | 'strength training'
        | 'cardio'
        | 'kettlebell'
        | 'mobility/flexibility'
        | 'HIIT'
        | 'recovery'
        | 'fms'
        | 'smr'
      exercise_taxonomy_assignment_source: 'derived' | 'manual'
      exercise_taxonomy_dimension:
        | 'category'
        | 'equipment'
        | 'pattern_family'
        | 'laterality'
        | 'exact_pattern'
      movement_pattern:
        | 'gait_stability'
        | 'gait_crawling'
        | 'hip_dominant_bilateral'
        | 'hip_dominant_unilateral'
        | 'knee_dominant_bilateral'
        | 'knee_dominant_unilateral'
        | 'horizontal_push_bilateral'
        | 'horizontal_push_unilateral'
        | 'horizontal_pull_bilateral'
        | 'horizontal_pull_unilateral'
        | 'vertical_push_bilateral'
        | 'vertical_push_unilateral'
        | 'vertical_pull_bilateral'
        | 'stability_anti_extension'
        | 'stability_anti_rotation'
        | 'stability_anti_flexion'
        | 'core_other'
        | 'local_exercises'
        | 'upper_body_mobility'
        | 'aslr_correction_first'
        | 'aslr_correction_second'
        | 'sm_correction_first'
        | 'sm_correction_second'
        | 'stability_correction'
        | 'mobilization'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

export type Profile = Tables<'profiles'>
export type Exercise = Tables<'exercises'>
export type Workout = Tables<'workouts'>
export type Appointment = Tables<'appointments'>
export type AppointmentParticipant = Tables<'appointments_participants'>
export type FmsAssessment = Tables<'fms_assessments'>
export type UserWeight = Tables<'user_weights'>
export type UserMeasurement = Tables<'user_measurements'>
