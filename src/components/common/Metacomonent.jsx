import { Helmet } from "react-helmet-async";

export default function MetaComponent({ meta }) {
  return (
    <Helmet>
      <title>{meta?.title}</title>
      <meta name="description" content={meta?.description} />
    </Helmet>
  );
}
