const Footer = () => {
  return (
    <footer className="bg-gray-50 py-8 w-full">
      <div className="container mx-auto px-4 text-xs">
        <div className="text-center space-y-2">
          <p>
            <span className="text-gray-500 font-light">COMPANY.</span>
            <span className="text-black font-normal"> Triv </span>
            <span className="text-gray-500 font-light">OWNER.</span>
            <span className="text-black font-normal"> LEE YURI </span>
          </p>
          <p>
            <span className="text-gray-500 font-light">ADDRESS.</span>
            <span className="text-black font-normal">
              {" "}
              서울특별시 강남구 도산대로 210 6층 <span className="mx-2 text-gray-300">|</span> 6th Floor, 210 Dosan-daero, Gangnam-gu, Seoul
            </span>
          </p>
          <p>
            <span className="text-gray-500 font-light">TEL.</span>
            <span className="text-black font-normal"> 070-0000-0000 </span>
            <span className="text-gray-500 font-light">E-MAIL.</span>
            <span className="text-black font-normal"> eyuri12@naver.com</span>
          </p>
          <p className="mt-4 text-sm">
            <span className="text-black font-normal">© 2024 Triv</span>
            <span className="text-gray-500 font-light">. build by Coaspe</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
