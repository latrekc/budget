import Header from "./components/header";

export default function Page() {
  return (
    <>
      <Header />

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="columns-2">
            <p>Well, let me tell you something, ...</p>
            <p className="break-inside-avoid-column">
              Sure, go ahead, laugh...
            </p>
            <p>Maybe we can live without...</p>
            <p>Look. If you think this is...</p>
          </div>
        </div>
      </main>
    </>
  );
}
