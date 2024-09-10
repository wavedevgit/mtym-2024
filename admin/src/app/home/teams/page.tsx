"use client"

import { adminState } from "@/store/adminState";
import { useRecoilValue } from "recoil";

export default function TeamsPage() {
  const adminData = useRecoilValue(adminState);

  return (
    <div className="space-y-4">
      <div className='from-black to-stone-500 bg-clip-text text-4xl font-medium'>
        Teams
      </div>
    </div>
  );
}