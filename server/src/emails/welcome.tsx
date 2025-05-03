import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export const Welcome: React.FC = () => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            brand: "#db2626",
          },
        },
      },
    }}
  >
    <Html>
      <Head />
      <Preview>Discover Dog-Friendly Places.</Preview>
      <Body className="bg-white">
        <Container className="margin-auto py-10 px-12">
          <Img
            src="https://res.cloudinary.com/drlwnmkq9/image/upload/v1738888080/static/logo.png"
            width="170"
            height="50"
            alt="Christmas Lights App Logo"
            className="m-auto"
          />
        </Container>
      </Body>
      <Text className="text-lg">Welcome to Woofs Welcome! 🎉</Text>
      <Text className="text-base">
        The best place to find all the dog-friendly places in New Zealand
      </Text>
      <Section>
        <Text>
          Best,
          <br />
          The Woofs Welcome team.
        </Text>
        <Hr className="text-[#cccccc] my-10" />
        <Text className="text-[#8898aa] font-sm">The dog house. 🐶</Text>
      </Section>
    </Html>
  </Tailwind>
);
