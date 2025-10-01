"use client"

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { Button } from './ui/button';
import { MenuIcon, MoonIcon, SunIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

function MobileNavbar() {
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme , setTheme } = useTheme();

  return (
    <div className='flex md:hidden items-center space-x-2'>
        <Button variant='ghost' size='icon' onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <SunIcon className='h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0'/>
            <MoonIcon className='absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'/>
            <span className='sr-only'>Toggle Theme</span>
        </Button>
        <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}
        >
            <SheetTrigger asChild>
                <Button variant='ghost'size='icon'>
                    <MenuIcon className='h-5 w-5'/> 
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className='w-[300px]'>
                <SheetHeader>
                    <SheetTitle>
                        Menu
                    </SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    </div>
  )
}

export default MobileNavbar