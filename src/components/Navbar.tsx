import Link from 'next/link';
import { Button, buttonVariants } from './ui/button';
import { Ham, HandCoins, HandHelping, HandIcon, HandMetal, Handshake, LucideHandCoins } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { signOut } from 'next-auth/react';
import { UserAccountnav } from './UserAccountnav';
import StudentsListPage from '@/app/(dashboard)/studentsList/page';
import { group } from 'console';

const Navbar = async () => {
  
  const session = await getServerSession(authOptions)
  
  return (
    <div className=' bg-zinc-100 py-2 border-b border-s-zinc-200 fixed w-full z-10 top-0'>
      <div className='container flex items-center justify-between'>
        <Link href='/'>
          <HandMetal />
        </Link>
        
        <Link href='/studentsList'>
          Жунал
        </Link>
        <h1>О нас</h1>
        <h1>Профиль</h1>  
        
      {session?.user ? (
        
        <UserAccountnav />
      ) : (
        <Link className={buttonVariants(
          
        )} href='/sign-in'>
        Войти
        </Link>

      )}

      </div>
    </div>
  );
};

export default Navbar;