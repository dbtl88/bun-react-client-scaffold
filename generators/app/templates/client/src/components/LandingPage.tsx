import HelmetWrapper from "./utility/HelmetWrapper";

export default function LandingPage() {
  return (
    <HelmetWrapper>
      <div className="flex justify-center pt-12">
        <div className="space-y-6">
          <h1 className="text-3xl">Template app</h1>
          <h2 className="text-xl">Template app with Yeoman generator.</h2>
        </div>
      </div>
    </HelmetWrapper>
  );
}