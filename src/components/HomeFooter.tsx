export function Footer() {
  return (
    <footer className="bg-primary text-primary-content">
      <div className="container mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-8 sm:py-12">
        <div className="space-y-2">
          <p className="font-semibold">Norwegian Institute for Nature Research (NINA)</p>
          <p className="text-sm">Postboks 5685 Torgarden</p>
          <p className="text-sm">7485 Trondheim</p>
        </div>
        <div className="space-y-5 sm:text-right">
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <a className="w-fit underline-offset-4 hover:underline" href="tel:+4773801400">
              (+47) 73 80 14 00
            </a>
            <a className="w-fit underline-offset-4 hover:underline" href="mailto:firmapost@nina.no">
              firmapost@nina.no
            </a>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm sm:justify-end" aria-label="Footer navigation">
            <a className="underline-offset-4 hover:underline" href="https://www.nina.no/kontakt-oss">
              Contact NINA
            </a>
            <a className="underline-offset-4 hover:underline" href="https://www.nina.no">
              NINA.no
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
