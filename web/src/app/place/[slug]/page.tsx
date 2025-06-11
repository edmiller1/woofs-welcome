interface Props {
  params: {
    slug: string;
  };
}

const PlacePage = async ({ params }: Props) => {
  const { slug } = params;
  return <>Hello place page - {slug}</>;
};

export default PlacePage;
