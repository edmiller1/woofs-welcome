import { Button } from "./ui/button";

export default function Contact() {
  return (
    <>
      <section className="my-10 py-10 px-8 border-t">
        <h2 className="my-3 font-semibold text-2xl xl:mb-8 xl:text-4xl xl:font-bold">
          Contact
        </h2>
        <p className="my-3 text-lg font-semibold">
          Got feedback or a dog-loving business to share?
        </p>
        <p className="my-3">
          We&apos;d love to hear from you! Shoot us an email at{" "}
          <a
            href="mailto:hello@pupfriendly.nz"
            className="underline hover:text-primary"
          >
            hello@pupfriendly.nz
          </a>{" "}
          and let us know your thoughts. <br /> Want to get your business
          listed? Learn more about submitting your dog-friendly haven down
          below.
        </p>
        <div className="mt-5 flex items-center space-x-5">
          <Button>List your Place</Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </section>
    </>
  );
}
