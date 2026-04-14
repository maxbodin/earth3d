import { Link } from '@/app/types/link'

export interface CreditItem {
   id: string
   title: string
   description: string
   links: Link[]
   tags?: string[]
}
