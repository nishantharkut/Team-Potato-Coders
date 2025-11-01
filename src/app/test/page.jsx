"use client";

// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { UserButton } from '@clerk/nextjs'
import { DotIcon } from 'lucide-react'
// import Link from 'next/link'
import React from 'react'

const TestPage = () => {
  return (
    <div>
        <UserButton>
        <UserButton.MenuItems>
          <UserButton.Action
            label="Open chat"
            labelIcon={<DotIcon />}
            onClick={() => alert('init chat')}
          />
        </UserButton.MenuItems>
        </UserButton>
      {/* <DropdownMenu asChild>  
      </DropdownMenu>
      <DropdownMenuContent align = 'end' className = 'w-48'>
        <DropdownMenuItem asChild>
          <Link href = '/'> User Profile </Link>
        </DropdownMenuItem>
      </DropdownMenuContent> */}
    </div>
  )
}

export default TestPage