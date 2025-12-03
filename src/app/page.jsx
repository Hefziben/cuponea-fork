import { createClient } from '@/utils/superbase/server'
import { redirect } from 'next/navigation'
import HomeClient from './home-client'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return <HomeClient />
}