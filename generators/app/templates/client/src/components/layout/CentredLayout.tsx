import HelmetWrapper from "../utility/HelmetWrapper";

type CenteredLayoutProps = {
  children?: React.ReactNode;
  wide?: boolean;
  title?: string;
  description?: string;
};

export default function CenteredLayout({
  // stickyBottom,
  children,
  wide,
  title,
  description,
}: CenteredLayoutProps) {
  return (
    <HelmetWrapper title={title} description={description}>
      <div className="flex justify-center pt-12">
        <div
          className={
            wide
              ? "relative relative max-w-md sm:max-w-3xl"
              : "relative max-w-md"
          }
        >
          {children}
        </div>
      </div>
    </HelmetWrapper>
  );
}
