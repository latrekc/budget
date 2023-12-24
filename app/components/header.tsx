import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
} from "@nextui-org/react";

export default function Header() {
  return (
    <Navbar isBordered maxWidth="full">
      <NavbarContent className="flex gap-4" justify="start">
        <NavbarItem isActive>
          <Link color="foreground" href="/" aria-current="page">
            Transactions
          </Link>
        </NavbarItem>

        <NavbarItem>
          <Link isDisabled>Balances</Link>
        </NavbarItem>

        <NavbarItem>
          <Link isDisabled>Shares</Link>
        </NavbarItem>

        <NavbarItem>
          <Link isDisabled>Dashboard</Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
