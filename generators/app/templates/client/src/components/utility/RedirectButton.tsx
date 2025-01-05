type RedirectButtonProps = {
  url: string;
  text: string;
};

export default function RedirectButton(props: RedirectButtonProps) {
  const login = () => {
    window.location = props.url as any
  }

  return (
    <div className={"btn btn-primary w-full sm:w-24"} onClick={login}>
      {props.text}
    </div>
  );
}