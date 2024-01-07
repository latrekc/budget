import { Link, Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";

export enum PageType {
  Transactions = "Transactions",
  Balances = "Balances",
  Shares = "Shares",
  Dashboard = "Dashboard",
}

export default function Header({ active }: { active: PageType }) {
  const pages = [
    { id: PageType.Transactions },
    { id: PageType.Balances, disabled: true },
    { id: PageType.Shares, disabled: true },
    { id: PageType.Dashboard },
  ];

  return (
    <Navbar isBordered maxWidth="full" className="bg-white/50">
      <NavbarContent className="flex gap-4" justify="start">
        {pages.map((page) => (
          <NavbarItem key={page.id} isActive={page.id === active}>
            {page.disabled ? (
              <Link isDisabled>{page.id}</Link>
            ) : (
              <Link
                color={page.id === active ? "foreground" : "primary"}
                href={`/${page.id.toLowerCase()}`}
                aria-current="page"
              >
                {page.id}
              </Link>
            )}
          </NavbarItem>
        ))}
      </NavbarContent>
    </Navbar>
  );
}
