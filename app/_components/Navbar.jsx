import Link from 'next/link'
import React from 'react'

function Navbar() {
  return (
    <nav className="bg-white py-2 shadow-md">
      <div className="container mx-auto pl-72 flex justify-between ">
        <div className="flex space-x-6 text-black text-base  font-medium pr-24">
          <Link href="/" className="px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105  hover:text-gray-500  rounded">Home</Link>
          <Link href="/careerPath" className="px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105  hover:text-gray-500 rounded">Career Path</Link>
          <Link href="/recomendation" className="px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105  hover:text-gray-500  rounded">Recomendations</Link>
          <Link href="/referalLeadsPage" className="px-3 py-2 transition-all duration-300 ease-in-out hover:scale-105  hover:text-gray-500  rounded">Reference Lesds</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
