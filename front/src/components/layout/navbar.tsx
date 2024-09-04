"use client";

import Image from "next/image";
import useScroll from "@/lib/hooks/use-scroll";
import { useAuthModal } from "./auth-modal";
import { UserNav } from "./user-nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import { userState } from "@/store/userState";
import { getToken } from "@/lib/utils";
import useMediaQuery from "@/lib/hooks/use-media-query";
import { Cross1Icon, HamburgerMenuIcon } from "@radix-ui/react-icons";

const links = [
  // {
  //   key: 'schedule',
  //   label: 'Programme',
  //   href: '/schedule',
  // },
  // {
  //   key: 'organizing-team',
  //   label: 'Equipe organisatrice',
  //   href: '/organizing-team',
  // },
  {
    key: 'problems',
    label: 'Dernière Édition',
    href: '/last-edition',
  },
  {
    key: 'problems',
    label: 'Test de sélection',
    href: '/selection',
  },
  {
    key: 'partenaires',
    label: 'Partenaires',
    href: '/partners',
  },
  // {
  //   key: 'past-edition',
  //   label: 'Past Edition',
  //   href: '/past-edition',
  // },
  // {
  //   key: 'past-edition',
  //   label: 'Past Edition',
  //   href: '/past-edition',
  // },
  {
    key: 'faq',
    label: 'FAQ',
    href: '/faq',
  },
];

export default function NavBar({ lang }: { lang: string }) {
  const { AuthModal, setShowAuthModal } = useAuthModal();
  const scrolled = useScroll(50);
  const userData = useRecoilValue(userState);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { isMobile, isTablet} = useMediaQuery();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {    
    const token = getToken();
    if (!token) {
      setIsLoading(false);
    }
  }, [])

  useEffect(() => {
    if (!userData) {
      localStorage.removeItem('access_token');
    }
    setIsLoading(false);
  }, [userData])

  const onMenuClick = (href: string) => {
    setShowMenu(false);
    router.push(href);
  }

  return (
    <>
      <AuthModal />
      <div
        className={`fixed top-0 w-full flex justify-center ${
          scrolled
            ? "border-b border-gray-200 bg-white/50 backdrop-blur-xl"
            : "bg-white/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 py-2 flex h-fit max-w-screen-xl items-center justify-between w-full">
          <div onClick={() => {onMenuClick('/')}} className="flex items-center font-display text-2xl hover:cursor-pointer">
            <Image
              src="/mm_circle.png"
              alt="M&M logo"
              width="40"
              height="40"
              className="mr-2 rounded-sm"
            ></Image>
          </div>

          <div
            className="mx-2 space-y-1 md:mx-0 space-x-2 md:space-x-6 text-center"
          >
            {!isMobile && !isTablet &&
              <>
                {links.map(link => {
                  return (
                    <button
                      key={link.key}
                      className="rounded-full font-base border border-gray-300 p-1.5 px-4 text-xs md:text-sm transition-all hover:bg-black hover:text-white"
                      onClick={() => {onMenuClick(link.href)}}
                    >
                      {link.label}
                    </button>
                  )
                })}
              </>
            }
          </div>

          <div className="space-x-4 flex items-center">
            {/* <LanguageSwitcher lang={lang}></LanguageSwitcher> */}
            {(isMobile || isTablet) && 
              <>
                <HamburgerMenuIcon className="h-8 w-8" onClick={() => {setShowMenu(true)}}/>
                
                <div className={`absolute min-h-screen w-full top-14 -left-4 bg-white ${!showMenu ? 'hidden' : ''} transition-all`}>
                  <div className="flex justify-between">
                    <div>{" "}</div>
                    <Cross1Icon className="h-8 w-8 mr-4" onClick={() => {setShowMenu(false)}}/>
                  </div>
                  
                  {links.map(link => {
                    return (
                      <div
                        key={link.key}
                        className="text-lg border border-white p-4 transition-all hover:bg-black hover:text-white"
                        onClick={() => {onMenuClick(link.href)}}
                      >
                        {link.label}
                      </div>
                    )
                  })}
                </div>
              </>
            }
            
            {!isLoading &&
              (
                userData
                ? (
                  <UserNav
                    firstName={userData.firstName}
                    lastName={userData.lastName} 
                    email={userData.email} 
                  />
                ) : (
                  <button
                    className="rounded-full border border-black bg-black p-1.5 px-4 text-sm text-white transition-all hover:bg-white hover:text-black"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Se connecter
                  </button>
                )
              )
            }
          </div>
        </div>
      </div>
    </>
  )
}
