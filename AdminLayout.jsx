"use client"

import Sidebar from "./Sidebar"

export default function AdminLayout({children}) {
  return (
    <div style={{display:"flex", background:"#000", color:"#fff", minHeight:"100vh"}}>
      
      <Sidebar/>

      <div style={{flex:1, padding:"30px"}}>
        {children}
      </div>

    </div>
  )
}