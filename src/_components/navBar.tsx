/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { RiCalendarScheduleFill, RiWechatLine } from "react-icons/ri";
import { FiFlag } from "react-icons/fi";
import { HiOutlineNewspaper, HiOutlineSquares2X2 } from "react-icons/hi2";
import { FaBusAlt, FaQuestion } from "react-icons/fa";
import { CiSquareCheck } from "react-icons/ci";
import { usePathname } from "next/navigation";
import { MdAttachMoney } from "react-icons/md";
import { useTheme } from "next-themes";
import Spinner from "./Spinner";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Cookie from "js-cookie";
import useLanguageStore, {
  useBooleanValue,
  useUserDataStore,
} from "~/APIs/store";
import { useProfile } from "~/APIs/hooks/useProfile";
import { SiGnuprivacyguard } from "react-icons/si";
import { FaQuoteLeft } from "react-icons/fa6";
import { FcSupport } from "react-icons/fc";
import { useNotificationsWebSocket } from "~/hooks/useNotifications";
import { Globe } from "lucide-react";
import { cn } from "~/lib/utils";
import { IoSearchOutline } from "react-icons/io5";
import Switch from "./Switch";
import { IoIosArrowDown, IoMdNotificationsOutline } from "react-icons/io";

interface NavBarLinkProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  small: boolean;
  url: string;
  onClick?: () => void;
}

const NavBarLink = ({
  onClick,
  href,
  icon: Icon,
  label,
  small,
  url,
}: NavBarLinkProps) => {
  const isActive = url === href;
  return (
    <li>
      <Link
        onClick={onClick}
        className={`flex ${small ? "w-[40px]" : ""} text-md text-navLinks group mt-4 items-center gap-x-3.5 rounded-lg px-2.5 py-2 font-sans font-semibold hover:bg-bgSecondary hover:text-primary`}
        href={href}
      >
        <Icon
          className={`h-10 w-10 ${small ? "" : "pl-4"} ${
            isActive
              ? `${small ? "" : "border-l-2"} border-primary text-primary`
              : ""
          }`}
        />
        {!small && (
          <p className={`translate-y-0.5 ${isActive ? "text-primary" : ""}`}>
            {label}
          </p>
        )}
      </Link>
    </li>
  );
};

const NavBar = () => {
  const [search, setSearch] = useState("");
  const toggleNav = useBooleanValue((state) => state.toggle);
  const [profile, setProfile] = useState(false);
  const toggleProfile = () => {
    setProfile(!profile);
  };
  const [isClient, setIsClient] = useState(false);
  const { data: dataUpdate } = useProfile();

  useUserDataStore.getState().setUserData({
    username: dataUpdate?.data.username,
    email: dataUpdate?.data.email,
    name_en: dataUpdate?.data.name,
    id: dataUpdate?.data.id?.toString(),
    picture: dataUpdate?.data.picture,
  });
  const userData = useUserDataStore.getState().userData;
  useEffect(() => {
    setIsClient(true);
  }, []);
  const { theme, setTheme } = useTheme();
  const url = usePathname();
  const [small, setSmall] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen5, setIsOpen5] = useState(false);

  const handleThemeChange = (value: boolean) => {
    setTheme(value ? "dark" : "light");
  };
  const toggleNavbar5 = () => {
    setIsOpen5(!isOpen5);
  };

  const DeleteCookie = () => {
    Cookie.remove("token");
    useUserDataStore.getState().clearUserData();
  };

  const toggleNavbarSmall = () => {
    setSmall(!small);
    toggleNav();
    if (!small == true) {
      setIsOpen5(true);
    }
    if (small == true) {
      setIsOpen5(false);
    }
  };

  const navbarRef = useRef<HTMLDivElement>(null);
  const toggleNavbar = () => {
    setIsOpen((prev) => !prev);
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  const userId = userData.id;
  const { notificationsCount, isConnected } = useNotificationsWebSocket(userId);

  const OpenSideBar = () => {
    setIsOpen(!isOpen);
  };

  const { language, setLanguage } = useLanguageStore();
  const [isOpenL, setIsOpenL] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
    { code: "fr", label: "Français" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenL(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const translate = (en: string, fr: string, ar: string) => {
    const language = useLanguageStore.getState().language; // Assuming useLanguageStore manages language state
    return language === "fr" ? fr : language === "ar" ? ar : en;
  };

  const navLinks = [
    {
      href: "/",
      icon: AiFillHome,
      label: translate("Home", "Accueil", "الرئيسية"),
    },
    {
      href: "/schedule",
      icon: RiCalendarScheduleFill,
      label: translate("My Schedule", "Mon emploi du temps", "جدولي"),
    },
    {
      href: "/bus",
      icon: FaBusAlt,
      label: translate("Bus Tracker", "Suivi du bus", "متتبع الحافلة"),
    },
    {
      href: "/finance",
      icon: MdAttachMoney,
      label: translate("Finance", "Finance", "المالية"),
    },
    {
      href: "/complaint",
      icon: FiFlag,
      label: translate("Complaint", "Réclamation", "شكوى"),
    },
    {
      href: "/attendance",
      icon: CiSquareCheck,
      label: translate("My Attendance", "Ma présence", "حضوري"),
    },
  ];

  if (!isClient)
    return (
      <div className="absolute left-0 top-0 z-[9999] flex h-screen w-full items-center justify-center bg-bgPrimary">
        <Spinner />
      </div>
    );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-40"
          onClick={toggleNavbar}
        ></div>
      )}
      <header ref={navbarRef}>
        <div>
          <header
            dir={language === "ar" ? "rtl" : "ltr"}
            className={`sticky inset-x-0 top-0 z-[48] flex w-full flex-wrap bg-bgPrimary py-2.5 text-sm sm:flex-nowrap sm:justify-start sm:py-4 lg:ps-64`}
          >
            <nav
              className="mx-auto flex w-full basis-full items-center px-4 sm:px-6"
              aria-label="Global"
            >
              <div className="me-5 lg:me-0 lg:hidden">
                <Link
                  className="inline-block flex-none rounded-xl text-xl font-semibold focus:opacity-80 focus:outline-none"
                  href="/"
                  aria-label="Preline"
                >
                  <img src="/images/logo.png" alt="#" />
                </Link>
              </div>
              <div className="ms-auto flex w-full items-center justify-end sm:order-3 sm:justify-between sm:gap-x-3">
                <div className="mb-3 hidden md:block">
                  <label htmlFor="icon" className="sr-only">
                    Search
                  </label>
                  <div className="relative min-w-72 md:min-w-80">
                    <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-4">
                      <IoSearchOutline className="text-powderBlue" size={24} />
                    </div>

                    <input
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      id="icon"
                      name="icon"
                      className="border-powderBlue block w-full rounded-lg border px-4 py-2 ps-11 text-lg outline-none focus:border-blue-500 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50"
                      placeholder={
                        language === "ar"
                          ? "ابحث "
                          : language === "fr"
                            ? "Rechercher"
                            : "Search"
                      }
                    />
                  </div>
                </div>
                <div className="sm:hidden">
                  <button
                    type="button"
                    className="inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center gap-x-2 rounded-full border border-transparent text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <svg
                      className="size-4 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </button>
                </div>

                <div className="hidden sm:block"></div>

                <div className="flex flex-row items-center justify-end gap-2">
                  <Switch theme={theme || "light"} setTheme={setTheme} />
                  <Link href="/chat">
                    <RiWechatLine className="mx-2 size-8 text-textPrimary" />
                  </Link>
                  <Link href="/notifies">
                    <IoMdNotificationsOutline className="size-8 text-textPrimary" />

                    {notificationsCount > 0 && (
                      <div className="absolute left-5 top-4 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-center text-sm text-white">
                        <span>{notificationsCount}</span>
                      </div>
                    )}
                  </Link>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-bgSecondary"
                      onClick={() => setIsOpenL(!isOpenL)}
                    >
                      <span>
                        {language === "en" ? (
                          <img
                            src="/images/en.png"
                            className="h-8 w-8"
                            alt="#"
                          />
                        ) : language === "ar" ? (
                          <img
                            src="/images/morocco.png"
                            className="h-8 w-8"
                            alt="#"
                          />
                        ) : language === "fr" ? (
                          <img
                            src="/images/fr.png"
                            className="h-8 w-8"
                            alt="#"
                          />
                        ) : (
                          <img
                            src="/images/fr.png"
                            className="h-8 w-8"
                            alt="#"
                          />
                        )}
                      </span>
                    </button>

                    {isOpenL && (
                      <div
                        className={`absolute ${language == "ar" ? "-right-10" : "right-0"} mt-2 w-48 rounded-md border bg-bgPrimary shadow-lg`}
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsOpenL(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-bgSecondary ${
                              language === lang.code ? "bg-bgSecondary" : ""
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="hs-dropdown relative inline-flex [--placement:bottom-right]">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          onClick={toggleProfile}
                          className="focus-none relative flex items-center gap-2 rounded-full p-1 text-sm font-semibold text-gray-800 hover:bg-thead"
                        >
                          <img
                            className="h-8 w-8 rounded-full ring-2 ring-bgSecondary"
                            src={`${userData.picture ?? "/images/userr.png"}`}
                            alt="User Avatar"
                          />
                          <div
                            className={`flex flex-col text-left ${language === "ar" ? "mr-2" : "ml-2"}`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-textPrimary">
                                {userData?.name_en || "User"}
                              </span>
                              <IoIosArrowDown
                                className={`${language === "ar" ? "mr-6" : "ml-6"} text-textPrimary`}
                              />
                            </div>
                          </div>
                        </button>
                      </DropdownMenu.Trigger>

                      {profile && (
                        <DropdownMenu.Content
                          className={`fixed text-textPrimary ${language == "ar" ? "" : "right-[20px]"} top-[20px] min-w-60 rounded-lg bg-bgPrimary p-2 shadow-md`}
                          aria-labelledby="hs-dropdown-with-header"
                          align="end"
                          sideOffset={5}
                        >
                          <div className="rounded-t-lg bg-bgPrimary px-5 py-3">
                            <p className="text-sm text-textPrimary">
                              {language === "ar"
                                ? "تم تسجيل الدخول كـ"
                                : language === "fr"
                                  ? "Connecté en tant que"
                                  : "Signed in as"}
                            </p>
                            <p className="text-sm font-medium text-textPrimary">
                              {userData?.email}
                            </p>
                          </div>
                          <div className="mt-2 py-2">
                            <DropdownMenu.Item asChild>
                              <Link
                                className="flex items-center gap-x-3.5 rounded-lg border-none px-3 py-2 text-sm text-textPrimary outline-none hover:bg-bgSecondary"
                                href="/profile"
                              >
                                <svg
                                  className="h-4 w-4 flex-shrink-0"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                {language === "ar"
                                  ? "الملف الشخصي"
                                  : language === "fr"
                                    ? "Profil"
                                    : "Profile"}
                              </Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item asChild>
                              <a
                                onClick={() => DeleteCookie()}
                                className="flex items-center gap-x-3.5 rounded-lg border-none px-3 py-2 text-sm text-textPrimary outline-none hover:bg-error hover:text-white"
                                href="/login"
                              >
                                {language === "ar"
                                  ? "تسجيل الخروج"
                                  : language === "fr"
                                    ? "Se déconnecter"
                                    : "Sign out"}
                              </a>
                            </DropdownMenu.Item>
                          </div>
                        </DropdownMenu.Content>
                      )}
                    </DropdownMenu.Root>
                  </div>

                </div>
              </div>
            </nav>
          </header>
          <div className="sticky inset-x-0 top-0 z-20 border-y border-borderPrimary bg-bgPrimary px-4 sm:px-6 md:px-8 lg:hidden">
            <div className="flex items-center justify-between py-2">
              <ol className="ms-3 flex items-center whitespace-nowrap">
                <li className="flex items-center text-sm text-textPrimary">
                  {/* Breadcrumb or other content */}
                </li>
              </ol>

              <button
                onClick={OpenSideBar}
                type="button"
                className="flex items-center justify-center gap-x-1.5 rounded-lg border border-borderPrimary px-3 py-2 text-xs text-gray-500 hover:text-gray-600"
                data-hs-overlay="#application-sidebar"
                aria-controls="application-sidebar"
                aria-label="Sidebar"
              >
                <svg
                  className="size-4 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 8L21 12L17 16M3 12H13M3 6H13M3 18H13" />
                </svg>
                <span className="sr-only">Sidebar</span>
              </button>
            </div>
          </div>

          <div
            dir={language === "ar" ? "rtl" : "ltr"}
            id="application-sidebar"
            className={cn(
              "fixed inset-y-0 start-0 z-[60] transform bg-bgPrimary transition-all duration-300 ease-in lg:bottom-0 lg:end-auto lg:block",
              small ? "w-[90px]" : "w-[260px]",
              small ? "" : "overflow-y-auto",
              "drop-shadow-2xl lg:drop-shadow-none",
              language === "ar"
                ? isOpen
                  ? "max-lg:translate-x-0"
                  : "max-lg:translate-x-full"
                : isOpen
                  ? "max-lg:translate-x-0"
                  : "max-lg:-translate-x-full",
            )}
          >
            <div className="px-8 pt-4">
              <Link href="/">
                {small ? (
                  <img
                    className="mt-5 scale-[2]"
                    src="/images/small logo.png"
                    alt="Logo"
                  />
                ) : (
                  <img
                    className="-translate-7 w-[150px] translate-y-3"
                    src="/images/logo.png"
                    alt="Logo"
                  />
                )}
              </Link>
            </div>
            <div className="mx-5 flex -translate-y-6 justify-end">
              {!small && (
                <button onClick={toggleNavbarSmall}>
                  <svg
                    className="h-8 w-8 text-textPrimary"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <nav
              className={`hs-accordion-group flex w-full flex-col flex-wrap p-6`}
              data-hs-accordion-always-open
            >
              <ul className="space-y-1.5">
                <div
                  className={`flex ${small ? "w-[40px]" : ""} justify-center`}
                >
                  {small && (
                    <button onClick={toggleNavbarSmall}>
                      <svg
                        className="h-6 w-6 text-textPrimary"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" />
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </button>
                  )}
                </div>
                {navLinks.map((link) => (
                  <NavBarLink
                    onClick={() => setIsOpen(false)}
                    key={link.href}
                    href={link.href}
                    icon={link.icon}
                    label={link.label}
                    small={small}
                    url={url}
                  />
                ))}
                <li className="group relative">
                  <button
                    onClick={toggleNavbar5}
                    className={`flex ${!small ? "w-full" : ""} text-md group mt-4 items-center gap-x-3.5 rounded-lg px-2.5 py-2 font-sans font-bold text-secondary hover:bg-bgSecondary hover:text-primary`}
                  >
                    <HiOutlineSquares2X2
                      className={`h-10 w-10 ${small ? "h-6 w-6" : "pl-4"} ${isOpen5 ? `${small ? "" : "border-l-2"} border-primary text-primary` : ""} text-textPrimary`}
                    />
                    {!small && (
                      <p
                        className={`text-textPrimary ${isOpen5 ? "text-primary" : ""}`}
                      >
                        {translate("Academic", "Académique", "أكاديمي")}
                      </p>
                    )}
                  </button>
                  {isOpen5 && (
                    <ul
                      className={`${small ? "hidden w-fit -translate-y-[100px] translate-x-5 whitespace-nowrap rounded-xl bg-bgPrimary p-2 group-hover:grid" : ""} mx-9 mt-2 grid gap-2 text-[14px] font-semibold`}
                    >
                      <Link
                        onClick={() => setIsOpen(false)}
                        className={`hover:text-primary ${
                          url === "/homework" ? "text-primary" : ""
                        }`}
                        href="/homework"
                      >
                        {translate("Homework", "Devoirs", "الواجبات")}
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className={`hover:text-primary ${
                          url === "/textbooks" ? "text-primary" : ""
                        }`}
                        href="/textbooks"
                      >
                        {translate("Textbooks", "Manuels", "الكتب المدرسية")}
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className={`hover:text-primary ${
                          url === "/grades" ? "text-primary" : ""
                        }`}
                        href="/grades"
                      >
                        {translate("Grades", "Notes", "الدرجات")}
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className={`hover:text-primary ${
                          url === "/exam" ? "text-primary" : ""
                        }`}
                        href="/exam"
                      >
                        {translate("Exam", "Examen", "الامتحان")}
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className={`hover:text-primary ${
                          url === "/questions" ? "text-primary" : ""
                        }`}
                        href="/questions"
                      >
                        {translate("Questions", "Questions", "الاسئلة")}
                      </Link>
                    </ul>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
};

export default NavBar;
