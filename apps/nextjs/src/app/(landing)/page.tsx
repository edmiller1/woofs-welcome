import { Heading } from "../_components/heading";
import { MaxWidthWrapper } from "../_components/max-width-wrapper";
import { ShinyButton } from "../_components/shiny-button";
import { BusinessFeatures } from "./business-features";
import { Features } from "./features";
import { Footer } from "./footer";
import { Pricing } from "./pricing";
import { Testimonials } from "./testimonials";

const LandingPage = () => {
  return (
    <>
      <section className="bg-brand-25 relative py-24 sm:py-32">
        <MaxWidthWrapper className="text-center">
          <div className="relative mx-auto flex flex-col items-center gap-10 text-center">
            <div>
              <Heading>
                <span>Explore and Discover New Zealand's</span>
                <br />
                <span className="text-primary">Dog Friendly</span> places
              </Heading>
            </div>

            <p className="max-w-prose text-pretty text-center text-lg text-gray-600">
              Looking for the perfect spot to explore with your furry best
              friend? Our website is your go-to guide for all things
              dog-friendly in New Zealand. From scenic hikes and cozy cafes to
              dog-friendly beaches and accommodations, we've got you covered.
              Find your next adventure together!
            </p>

            <div className="w-full max-w-80">
              <ShinyButton
                href="/sign-up"
                className="relative z-10 h-14 w-full text-base shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                Get Started
              </ShinyButton>
            </div>
          </div>
        </MaxWidthWrapper>
      </section>

      <section className="relative bg-gray-50 pb-4">
        <Features />
      </section>

      <section className="relative bg-white py-24 sm:py-32">
        <BusinessFeatures />
      </section>

      <section className="relative bg-gray-50 pb-4">
        <Pricing />
      </section>

      <section className="relative bg-white py-24 sm:py-32">
        <Testimonials />
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;
