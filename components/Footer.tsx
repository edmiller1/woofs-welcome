export default function Footer() {
  return (
    <footer className="bg-accent-1 border-t border-accent-2">
      <div className="px-10">
        <div className="py-12 flex flex-col lg:flex-row items-center">
          <h4 className="text-sm tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:w-full">
            &copy; {new Date().getFullYear()}. Pup Friendly. All rights
            reserved.
          </h4>
          <div className="text-sm flex flex-col lg:flex-row justify-center items-center lg:w-[75%] lg:space-x-5">
            <a href="https://nextjs.org/docs" className="hover:underline">
              About Us
            </a>
            <a
              href={`https://github.com/vercel/next.js/tree/canary/examples/`}
              className="hover:underline"
            >
              List a Place
            </a>
            <a
              href={`https://github.com/vercel/next.js/tree/canary/examples/`}
              className="hover:underline"
            >
              Promote
            </a>
            <a
              href={`https://github.com/vercel/next.js/tree/canary/examples/`}
              className="hover:underline"
            >
              Advertise
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
