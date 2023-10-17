'use client';

import Logo from '../logo';
import useWindowSize from '#www/hooks/use-window-size';
import Link from 'next/link';
import HeaderMobile from './mobile';

type MainHeaderProps = {
  title?: string;
  description?: string;
};
export type MenusType = { link: string; label: string }[];

export default function MainHeader({
  title = 'codeup',
  description = '',
}: MainHeaderProps) {
  const { isMobile } = useWindowSize();
  const menus: MenusType = [
    {
      link: '/',
      label: 'Home',
    },

    {
      link: '/upik',
      label: 'Upik',
    },
  ];
  return (
    <>
      <header className="">
        {isMobile ? (
          <HeaderMobile menus={menus} />
        ) : (
          <div className="base-container">
            <nav className="nav">
              <ul>
                {menus.map((menu, i) => (
                  <li key={i}>
                    <Link href={menu.link}>{menu.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        <div className="base-container">
          <div className="flex items-end gap-8 pt-[20px]">
            <div className="bg-base rounded-t-lg">
              <Logo className="w-[150px] h-[150px] text-primary -mb-10" />
            </div>
            <div className="flex flex-col gap-2 w-full text-white">
              <h1 className="text-xl md:text-2xl lg:text-5xl">{title}</h1>
              <div className="font-mono mb-2">{description}</div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
