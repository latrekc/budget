import { Link, Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";

export enum PageType {
  Balances = "Balances",
  Currencies = "Currencies",
  Dashboard = "Dashboard",
  Shares = "Shares",
  Transactions = "Transactions",
}

export default function Header({ active }: { active: PageType }) {
  const pages = [
    { id: PageType.Transactions },
    { disabled: true, id: PageType.Balances },
    { disabled: true, id: PageType.Shares },
    { id: PageType.Dashboard },
    { id: PageType.Currencies },
  ];

  return (
    <Navbar isBordered maxWidth="full">
      <NavbarContent className="flex gap-4" justify="start">
        {pages.map((page) => (
          <NavbarItem isActive={page.id === active} key={page.id}>
            {page.disabled ? (
              <Link isDisabled>{page.id}</Link>
            ) : (
              <Link
                aria-current="page"
                color={page.id === active ? "foreground" : "primary"}
                href={`/${page.id.toLowerCase()}`}
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
