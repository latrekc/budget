import { Link } from "@nextui-org/react";

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
    <header className="border-b border-divider">
      <nav className="mx-auto flex max-w-full gap-4 px-4 py-3">
        {pages.map((page) => (
          <div key={page.id} data-active={page.id === active}>
            {page.disabled ? (
              <span className="text-muted cursor-not-allowed">{page.id}</span>
            ) : (
              <Link
                aria-current={page.id === active ? "page" : undefined}
                href={`/${page.id.toLowerCase()}`}
              >
                {page.id}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}
