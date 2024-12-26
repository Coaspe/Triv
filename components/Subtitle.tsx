interface SubtitleProps {
  title: string;
}

const Subtitle = ({ title }: SubtitleProps) => {
  return <h1 className="text-center text-sm font-extrabold text-black mb-12">{title}</h1>;
};

export default Subtitle;
