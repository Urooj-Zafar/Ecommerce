"use client"

import { usePathname } from 'next/navigation'
import React from 'react'
import Nav from './Nav'
import Footer from './Footer'
import Sidebar from './Sidebar'
import Dnav from './Dnav'
const Layout = ({children}) => {
    const pathname = usePathname()
  return (
    <>
    {pathname.startsWith("/admin")?(
        <>
                <div className=' h-screen flex'>
                  <Sidebar/>
                  <div className=' flex-1 overflow-auto'>
                    <Dnav/>
        {children}
                  </div>
                </div>
                </>
    ):(
        <div className='bg-gray-100 p-5'>
            <Nav/>
            {children}
            <Footer/>
        </div>
    )}
    </>
  )
}

export default Layout
