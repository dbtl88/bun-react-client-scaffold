import { Helmet } from "react-helmet-async";

type HelmetProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

export default function HelmetWrapper({
  children,
  title,
  description,
}: HelmetProps) {
  return (
    <>
      <Helmet>
        <title>{title ?? "Template App"}</title>
        <meta name="description" content={description ?? "Template app scaffold, automatically generated"} />
      </Helmet>
      {children}
    </>
  );
}
