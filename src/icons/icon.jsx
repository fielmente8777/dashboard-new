export const Filter = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="sliders-h"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-3 h-3"
    >
      <path
        fill="currentColor"
        d="M496 384H160v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h80v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h336c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160h-80v-16c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h336v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h80c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm0-160H288V48c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16v16H16C7.2 64 0 71.2 0 80v32c0 8.8 7.2 16 16 16h208v16c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16v-16h208c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"
      ></path>
    </svg>
  );
};

export const DocumentIcon = ({ size = 16, color = "#000000", ...props }) => {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      fill={color}
      {...props}
    >
      <path
        fill="#7A51CC"
        d="M439.652,512H72.348c-9.217,0-16.696-7.479-16.696-16.696V16.696C55.652,7.479,63.131,0,72.348,0
        h233.739c4.424,0,8.674,1.761,11.804,4.892l133.565,133.565c3.131,3.13,4.892,7.379,4.892,11.804v345.043
        C456.348,504.521,448.869,512,439.652,512z"
      />
      <path
        fill="#5947B3"
        d="M317.891,4.892C314.761,1.761,310.511,0,306.087,0H256v512h183.652
        c9.217,0,16.696-7.479,16.696-16.696V150.261c0-4.424-1.761-8.674-4.892-11.804L317.891,4.892z"
      />
      <path
        fill="#7A51CC"
        d="M451.459,138.459L317.891,4.892C314.76,1.76,310.511,0,306.082,0h-16.691l0.001,150.261
        c0,9.22,7.475,16.696,16.696,16.696h150.26v-16.696C456.348,145.834,454.589,141.589,451.459,138.459z"
      />

      {/* Circles */}
      <circle fill="#FFFFFF" cx="139.13" cy="261.565" r="16.696" />
      <circle fill="#FFFFFF" cx="139.13" cy="328.348" r="16.696" />
      <circle fill="#FFFFFF" cx="139.13" cy="395.13" r="16.696" />

      {/* Lines */}
      <path
        fill="#FFFFFF"
        d="M372.87,411.826H205.913c-9.217,0-16.696-7.479-16.696-16.696
        c0-9.217,7.479-16.696,16.696-16.696H372.87c9.217,0,16.696,7.479,16.696,16.696
        C389.565,404.348,382.087,411.826,372.87,411.826z"
      />
      <path
        fill="#E6F3FF"
        d="M372.87,378.435H256v33.391h116.87c9.217,0,16.696-7.479,16.696-16.696
        C389.565,385.913,382.087,378.435,372.87,378.435z"
      />
      <path
        fill="#FFFFFF"
        d="M372.87,345.043H205.913c-9.217,0-16.696-7.479-16.696-16.696
        c0-9.217,7.479-16.696,16.696-16.696H372.87c9.217,0,16.696,7.479,16.696,16.696
        C389.565,337.565,382.087,345.043,372.87,345.043z"
      />
      <path
        fill="#E6F3FF"
        d="M372.87,311.652H256v33.391h116.87c9.217,0,16.696-7.479,16.696-16.696
        C389.565,319.131,382.087,311.652,372.87,311.652z"
      />
      <path
        fill="#FFFFFF"
        d="M372.87,278.261H205.913c-9.217,0-16.696-7.479-16.696-16.696
        c0-9.217,7.479-16.696,16.696-16.696H372.87c9.217,0,16.696,7.479,16.696,16.696
        C389.565,270.782,382.087,278.261,372.87,278.261z"
      />
      <path
        fill="#E6F3FF"
        d="M372.87,244.87H256v33.391h116.87c9.217,0,16.696-7.479,16.696-16.696
        C389.565,252.348,382.087,244.87,372.87,244.87z"
      />
    </svg>
  );
};


export const MailIcon = ({ size = 20, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 11.9556C2 8.47078 2 6.7284 2.67818 5.39739C3.27473 4.22661 4.22661 3.27473 5.39739 2.67818C6.7284 2 8.47078 2 11.9556 2H20.0444C23.5292 2 25.2716 2 26.6026 2.67818C27.7734 3.27473 28.7253 4.22661 29.3218 5.39739C30 6.7284 30 8.47078 30 11.9556V20.0444C30 23.5292 30 25.2716 29.3218 26.6026C28.7253 27.7734 27.7734 28.7253 26.6026 29.3218C25.2716 30 23.5292 30 20.0444 30H11.9556C8.47078 30 6.7284 30 5.39739 29.3218C4.22661 28.7253 3.27473 27.7734 2.67818 26.6026C2 25.2716 2 23.5292 2 20.0444V11.9556Z"
        fill=""
      />

      <path
        d="M22.0515 8.52295L16.0644 13.1954L9.94043 8.52295V8.52421L9.94783 8.53053V15.0732L15.9954 19.8466L22.0515 15.2575V8.52295Z"
        fill="#EA4335"
      />

      <path
        d="M23.6231 7.38639L22.0508 8.52292V15.2575L26.9983 11.459V9.17074C26.9983 9.17074 26.3978 5.90258 23.6231 7.38639Z"
        fill="#FBBC05"
      />

      <path
        d="M22.0508 15.2575V23.9924H25.8428C25.8428 23.9924 26.9219 23.8813 26.9995 22.6513V11.459L22.0508 15.2575Z"
        fill="#34A853"
      />

      <path
        d="M9.94014 8.52404L8.37646 7.39382C5.60179 5.91001 5 9.17692 5 9.17692V11.4651L9.94014 15.0667V8.52404Z"
        fill="#C5221F"
      />

      <path
        d="M5 11.4668V22.6591C5.07646 23.8904 6.15673 24.0003 6.15673 24.0003H9.94877L9.94014 15.0671L5 11.4668Z"
        fill="#4285F4"
      />
    </svg>
  );
};

export const ChatIcon = ({ size = 16, ...props }) => {
  return (
    <svg
      height={size}
      width={size}
      viewBox="0 0 512 512"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="#e9891c"
        d="M218.944,400.496h265.52c15.2,0,27.536-12.64,27.536-28.224V28.224C512,12.64,499.664,0,484.464,0
        H27.536C12.336,0,0,12.64,0,28.224v344.24c0,15.584,12.336,28.224,27.536,28.224H80.64L47.248,512l156.608-106.88
        C208.336,402.112,213.584,400.496,218.944,400.496z"
      />
      <circle fill="#FFFFFF" cx="256" cy="137.984" r="57.136" />
      <path
        fill="#FFFFFF"
        d="M346.464,312.96c-0.992-54.576-41.072-98.496-90.464-98.496
        s-89.472,43.92-90.464,98.496H346.464z"
      />
    </svg>
  );
};
export const TeamIcon = ({ size = 16, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Center User */}
      <circle fill="#84DCCF" cx="255.997" cy="206.361" r="63.823" />
      <path
        fill="#027EA8"
        d="M256.001,142.534c-17.729,0-33.76,7.238-45.326,18.909
        c7.427-3.026,15.536-4.726,24.051-4.726
        c35.25,0,63.825,28.575,63.825,63.824
        c0,17.52-7.069,33.382-18.498,44.915
        c23.32-9.501,39.773-32.364,39.773-59.099
        C319.824,171.109,291.249,142.534,256.001,142.534z"
      />
      <path
        fill="#84DCCF"
        d="M326.916,475.839H185.085V362.374
        c0-39.166,31.75-70.916,70.916-70.916
        s70.916,31.75,70.916,70.916V475.839z"
      />

      {/* Right User */}
      <circle fill="blue" cx="433.29" cy="99.979" r="63.823" />
      <path
        fill="blue"
        d="M504.205,369.465H362.374V255.999
        c0-39.166,31.75-70.916,70.916-70.916
        s70.916,31.75,70.916,70.916V369.465z"
      />

      {/* Left User */}
      <circle fill="#FBB03B" cx="78.705" cy="99.979" r="63.823" />
      <path
        fill="#FBB03B"
        d="M149.626,369.465H7.795V255.999
        c0-39.166,31.75-70.916,70.916-70.916
        s70.916,31.75,70.916,70.916V369.465z"
      />

      {/* Outline Paths */}
      <path d="M256.001,277.977c-39.491,0-71.619-32.129-71.619-71.619
        s32.129-71.618,71.619-71.618s71.618,32.129,71.618,71.618
        C327.619,245.85,295.491,277.977,256.001,277.977z" />

      <path d="M334.71,483.634H177.289v-121.26
        c0-43.401,35.31-78.71,78.71-78.71
        s78.71,35.31,78.71,78.71V483.634z" />

      <path d="M512,377.26H354.579V255.999
        c0-43.401,35.31-78.71,78.709-78.71
        c43.402,0,78.71,35.31,78.71,78.71V377.26H512z" />

      <path d="M157.421,377.26H0V255.999
        c0-43.401,35.31-78.71,78.71-78.71
        c43.402,0,78.71,35.31,78.71,78.71V377.26z" />
    </svg>
  );
};


export const Search = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="search"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-4 h-3.5 svg-inline--fa fa-search fa-w-16 fa-lg"
    >
      <path
        fill="#575757"
        d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
        className=""
      ></path>
    </svg>
  );
};
export const Arrow = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fas"
      data-icon="chevron-left"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className="w-3 h-3 svg-inline--fa fa-chevron-left fa-w-10 fa-sm"
    >
      <path
        fill="currentColor"
        d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"
        className=""
      ></path>
    </svg>
  );
};

export const OTA = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_30_2788)">
        <path
          d="M1.64632 3.8647C2.29667 3.8647 2.82388 3.33749 2.82388 2.68713C2.82388 2.03678 2.29667 1.50957 1.64632 1.50957C0.995965 1.50957 0.46875 2.03678 0.46875 2.68713C0.46875 3.33749 0.995965 3.8647 1.64632 3.8647Z"
          stroke="white"
          strokeMiterlimit="10"
        />
        <path
          d="M15.5312 1.28082H4.69897V4.09351H15.5312V1.28082Z"
          stroke="white"
          strokeMiterlimit="10"
        />
        <path
          d="M1.64632 9.17757C2.29667 9.17757 2.82388 8.65035 2.82388 8C2.82388 7.34965 2.29667 6.82243 1.64632 6.82243C0.995965 6.82243 0.46875 7.34965 0.46875 8C0.46875 8.65035 0.995965 9.17757 1.64632 9.17757Z"
          stroke="white"
          strokeMiterlimit="10"
        />
        <path
          d="M15.5312 6.59365H4.69897V9.40635H15.5312V6.59365Z"
          stroke="white"
          strokeMiterlimit="10"
        />
        <path
          d="M1.64632 14.4904C2.29667 14.4904 2.82388 13.9632 2.82388 13.3129C2.82388 12.6625 2.29667 12.1353 1.64632 12.1353C0.995965 12.1353 0.46875 12.6625 0.46875 13.3129C0.46875 13.9632 0.995965 14.4904 1.64632 14.4904Z"
          stroke="white"
          strokeMiterlimit="10"
        />
        <path
          d="M15.5312 11.9065H4.69897V14.7192H15.5312V11.9065Z"
          stroke="white"
          strokeMiterlimit="10"
        />
      </g>
      <defs>
        <clipPath id="clip0_30_2788">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const PM = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_30_2963)">
        <path
          d="M4.83228 12.6933V13.1795C4.83228 13.5065 5.09731 13.7715 5.42422 13.7715H10.5755C10.9024 13.7715 11.1675 13.5064 11.1675 13.1795V12.6933H4.83228Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.9074 1.2287C10.8318 1.12429 10.6762 1.12429 10.6005 1.2287L8.85551 3.63629C8.76467 3.76163 8.8542 3.93707 9.00901 3.93707H9.69564C9.81027 3.93707 9.90324 4.03001 9.90324 4.14467V11.5996H11.6048V4.1447C11.6048 4.03007 11.6977 3.9371 11.8124 3.9371H12.499C12.6538 3.9371 12.7433 3.76163 12.6525 3.63632L10.9074 1.2287Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.25235 6.0259H6.97602C6.85862 6.0259 6.76343 6.12106 6.76343 6.2385V11.5996H8.46491V6.23847C8.46494 6.12106 8.36976 6.0259 8.25235 6.0259Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.11246 8.21342H3.83613C3.71872 8.21342 3.62354 8.30858 3.62354 8.42602V11.5996H5.32502V8.42599C5.32505 8.30858 5.22989 8.21342 5.11246 8.21342Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.69565 3.9371H9.00901C8.85423 3.9371 8.7647 3.76163 8.85551 3.63632L9.3808 2.91159H2.44401C2.27982 2.91159 2.14673 3.04469 2.14673 3.20887V11.3023C2.14673 11.4665 2.27982 11.5996 2.44401 11.5996H9.90324V4.1447C9.90324 4.03007 9.8103 3.9371 9.69565 3.9371Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.5559 2.91159H12.1271L12.6524 3.63632C12.7433 3.76166 12.6537 3.9371 12.499 3.9371H11.8123C11.6977 3.9371 11.6047 4.03004 11.6047 4.1447V11.5996H13.5559C13.7201 11.5996 13.8533 11.4665 13.8533 11.3023V3.20887C13.8533 3.04469 13.7202 2.91159 13.5559 2.91159Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.54689 14.8496H14.535C15.2119 14.8496 15.7657 14.2958 15.7657 13.6189V13.0847C15.7657 12.8686 15.5904 12.6933 15.3743 12.6933H0.625754C0.409595 12.6933 0.234375 12.8686 0.234375 13.0847V13.6189C0.234375 14.2958 0.788162 14.8496 1.46504 14.8496H7.45313"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.9471 6.70869V3.15759C14.9471 2.42071 14.3441 1.8178 13.6073 1.8178H11.3345L12.6525 3.63629C12.7433 3.76163 12.6538 3.93707 12.499 3.93707H11.8124C11.6977 3.93707 11.6048 4.03001 11.6048 4.14467V11.5996H9.90325V4.1447C9.90325 4.03007 9.81031 3.9371 9.69566 3.9371H9.00903C8.85424 3.9371 8.76471 3.76163 8.85552 3.63632L10.1735 1.81783H2.39277C1.65586 1.81783 1.05298 2.42074 1.05298 3.15762V11.3535C1.05298 12.0904 1.65586 12.6933 2.39277 12.6933H13.6073C14.3441 12.6933 14.9471 12.0904 14.9471 11.3535V7.80245"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_30_2963">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const GL = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_30_2993)">
        <mask
          id="mask0_30_2993"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path d="M0 9.53674e-07H16V16H0V9.53674e-07Z" fill="white" />
        </mask>
        <g mask="url(#mask0_30_2993)">
          <path
            d="M14.0168 6.56247H15.6406C15.7096 6.56247 15.7656 6.61844 15.7656 6.68747V7.99997C15.7656 8.49122 15.72 8.97153 15.6325 9.43747C14.9555 13.0566 11.7671 15.7918 7.94524 15.7654C3.65689 15.7358 0.224926 12.2709 0.234395 7.98244C0.240395 5.2645 1.6428 2.87441 3.76221 1.49157"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.05542 11.9052C5.87451 12.5238 6.89439 12.8907 7.99989 12.8907C10.2005 12.8907 12.0618 11.4369 12.6755 9.43753H8.12489C8.05586 9.43753 7.99989 9.38157 7.99989 9.31253V6.68753C7.99989 6.6185 8.05586 6.56253 8.12489 6.56253H13.0023"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.63283 1.0004C5.65143 0.50949 6.79361 0.234365 8.00002 0.234365C10.0983 0.234365 12.0022 1.0668 13.4 2.41899C13.4505 2.46783 13.4518 2.54824 13.4021 2.5979L11.5453 4.45471C11.4975 4.50252 11.4202 4.50374 11.3713 4.45715C10.494 3.62205 9.30699 3.10937 8.00002 3.10937C5.30112 3.10937 3.1278 5.26727 3.10949 7.96608C3.10102 9.21508 3.56083 10.3566 4.32371 11.2254"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.53155 5.93281L1.21265 4.25731"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.05884 11.469L3.44421 9.83434"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.3489 11.5814L13.6874 13.2708"
            stroke="white"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_30_2993">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const LS = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_30_3036)">
        <mask
          id="mask0_30_3036"
          style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="16"
          height="16"
        >
          <path d="M0 9.53674e-07H16V16H0V9.53674e-07Z" fill="white" />
        </mask>
        <g mask="url(#mask0_30_3036)">
          <path
            d="M10.8124 3.90625C10.8124 3.81144 10.8074 3.71778 10.7983 3.62538L11.4456 2.99938L10.5081 1.37563L9.63936 1.62413C9.48867 1.51569 9.32732 1.42178 9.15636 1.34447L8.93742 0.46875H7.06242L6.84348 1.34447C6.67251 1.42178 6.51117 1.51569 6.36048 1.62413L5.4917 1.37563L4.5542 2.99938L5.20157 3.62538C5.19242 3.71778 5.18742 3.81144 5.18742 3.90625C5.18742 4.00106 5.19242 4.09472 5.20157 4.18713L4.5542 4.81313L5.4917 6.43688L6.36048 6.18838C6.51117 6.29681 6.67251 6.39072 6.84348 6.46803L7.06242 7.34375H8.93742L9.15636 6.46803C9.32732 6.39072 9.48867 6.29681 9.63936 6.18838L10.5081 6.43688L11.4456 4.81313L10.7983 4.18713C10.8074 4.09472 10.8124 4.00106 10.8124 3.90625Z"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.0625 3.90625C7.0625 3.3885 7.48225 2.96875 8 2.96875C8.51775 2.96875 8.9375 3.3885 8.9375 3.90625C8.9375 4.424 8.51775 4.84375 8 4.84375C7.48225 4.84375 7.0625 4.424 7.0625 3.90625Z"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.09375 12.4063H3.59375C3.93894 12.4063 4.21875 12.6861 4.21875 13.0313V14.9063C4.21875 15.2515 3.93894 15.5313 3.59375 15.5313H1.09375C0.748563 15.5313 0.46875 15.2515 0.46875 14.9063V13.0313C0.46875 12.6861 0.748563 12.4063 1.09375 12.4063Z"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.9062 12.4062H12.4062C12.0611 12.4062 11.7812 12.686 11.7812 13.0312V14.9062C11.7812 15.2514 12.0611 15.5312 12.4062 15.5312H14.9062C15.2514 15.5312 15.5312 15.2514 15.5312 14.9062V13.0312C15.5312 12.686 15.2514 12.4062 14.9062 12.4062Z"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.75 12.4062H9.25C9.59519 12.4062 9.875 12.686 9.875 13.0312V14.9062C9.875 15.2514 9.59519 15.5312 9.25 15.5312H6.75C6.40481 15.5312 6.125 15.2514 6.125 14.9062V13.0312C6.125 12.686 6.40481 12.4062 6.75 12.4062Z"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.34375 12.4062V11.1562C2.34375 10.4659 2.90337 9.90625 3.59375 9.90625H8V7.34375"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.6562 12.4063V11.1563C13.6562 10.4659 13.0966 9.90628 12.4062 9.90628H8V7.34378"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 12.4062V9.90625"
            stroke="white"
            strokeWidth="0.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_30_3036">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const WD = () => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_30_3098)">
        <path
          d="M14.3943 1.50466C14.3943 1.01322 13.9959 0.614815 13.5045 0.614815H1.20234C0.710906 0.614815 0.3125 1.01322 0.3125 1.50466V2.82256H14.3943V1.50466Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.46406 13.3355H8.72937V12.124C8.72937 11.6884 9.0825 11.3353 9.51812 11.3353H14.3944V2.82266H0.3125V12.4455C0.3125 12.937 0.710938 13.3355 1.2025 13.3355H3.71419"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="1.56201" cy="1.69728" r="0.3125" fill="white" />
        <circle cx="2.70776" cy="1.69728" r="0.3125" fill="white" />
        <path
          d="M14.8986 15.3852H9.51803C9.0824 15.3852 8.72925 15.032 8.72925 14.5964V12.1241C8.72925 11.6884 9.0824 11.3353 9.51803 11.3353H14.8986C15.3342 11.3353 15.6874 11.6884 15.6874 12.1241V14.5964C15.6874 15.032 15.3342 15.3852 14.8986 15.3852Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.7561 14.1588L9.95679 13.3595L10.7561 12.5602"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.6609 14.1588L14.4602 13.3595L13.6609 12.5602"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.6046 12.5602L11.7466 14.1588"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5732 4.5545H2.09937V7.13125H12.5732V4.5545Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.57833 8.541H2.09937V9.99197H6.57833V8.541Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12.5732 8.541H8.03174V9.99197H12.5732V8.541Z"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.09937 11.6047H6.5783"
          stroke="white"
          strokeWidth="0.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="5.07373" cy="13.3355" r="0.3125" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_30_3098">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};


export const InstaICon=()=>{
  return (
<svg width="20px" height="20px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint0_radial_87_7153)"></rect> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint1_radial_87_7153)"></rect> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint2_radial_87_7153)"></rect> <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white"></path> <defs> <radialGradient id="paint0_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)"> <stop stop-color="#B13589"></stop> <stop offset="0.79309" stop-color="#C62F94"></stop> <stop offset="1" stop-color="#8A3AC8"></stop> </radialGradient> <radialGradient id="paint1_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)"> <stop stop-color="#E0E8B7"></stop> <stop offset="0.444662" stop-color="#FB8A2E"></stop> <stop offset="0.71474" stop-color="#E2425C"></stop> <stop offset="1" stop-color="#E2425C" stop-opacity="0"></stop> </radialGradient> <radialGradient id="paint2_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)"> <stop offset="0.156701" stop-color="#406ADC"></stop> <stop offset="0.467799" stop-color="#6A45BE"></stop> <stop offset="1" stop-color="#6A45BE" stop-opacity="0"></stop> </radialGradient> </defs> </g></svg>

  )
}

export const FacebookIcon=()=>{
  return (
    <svg width="20px" height="20px" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Facebook-color</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Color-" transform="translate(-200.000000, -160.000000)" fill="#4460A0"> <path d="M225.638355,208 L202.649232,208 C201.185673,208 200,206.813592 200,205.350603 L200,162.649211 C200,161.18585 201.185859,160 202.649232,160 L245.350955,160 C246.813955,160 248,161.18585 248,162.649211 L248,205.350603 C248,206.813778 246.813769,208 245.350955,208 L233.119305,208 L233.119305,189.411755 L239.358521,189.411755 L240.292755,182.167586 L233.119305,182.167586 L233.119305,177.542641 C233.119305,175.445287 233.701712,174.01601 236.70929,174.01601 L240.545311,174.014333 L240.545311,167.535091 C239.881886,167.446808 237.604784,167.24957 234.955552,167.24957 C229.424834,167.24957 225.638355,170.625526 225.638355,176.825209 L225.638355,182.167586 L219.383122,182.167586 L219.383122,189.411755 L225.638355,189.411755 L225.638355,208 L225.638355,208 Z" id="Facebook"> </path> </g> </g> </g></svg>
  )
}


export const WhatsappIcon=()=>{
  return (
    <svg width="18px" height="18px" viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>Whatsapp-color</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Color-" transform="translate(-700.000000, -360.000000)" fill="#67C15E"> <path d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z" id="Whatsapp"> </path> </g> </g> </g></svg>
  )
}


export const LiveChatIcon=()=>{
  return (
    <svg width="20px" height="20px" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="Home"></g> <g id="Print"></g> <g id="Mail"></g> <g id="Camera"></g> <g id="Video"></g> <g id="Film"></g> <g id="Message"> <path d="M24,1h-7.9H8C4.1,1,1,4.1,1,8v10c0,3.5,2.6,6.4,6,6.9V30c0,0.4,0.2,0.7,0.5,0.9C7.7,31,7.8,31,8,31 c0.2,0,0.4-0.1,0.6-0.2l7.5-5.6l0.3-0.2H24c3.9,0,7-3.1,7-7V8C31,4.1,27.9,1,24,1z" fill="#fd5c01"></path> <path d="M16.1,7v2H8C7.5,9,7,8.5,7,8s0.5-1,1-1H16.1z" fill="#34B0C0"></path> <path d="M16.1,13v2H8c-0.5,0-1-0.5-1-1s0.5-1,1-1H16.1z" fill="#34B0C0"></path> <g> <path d="M8,9h8.1H24c0.5,0,1-0.5,1-1s-0.5-1-1-1h-7.9H8C7.5,7,7,7.5,7,8S7.5,9,8,9z" fill="#0a3a75"></path> <path d="M24,13h-7.9H8c-0.5,0-1,0.5-1,1s0.5,1,1,1h8.1H24c0.5,0,1-0.5,1-1S24.5,13,24,13z" fill="#0a3a75"></path> </g> </g> <g id="Telephone"></g> <g id="User"></g> <g id="File"></g> <g id="Folder"></g> <g id="Map"></g> <g id="Download"></g> <g id="Upload"></g> <g id="Video_Recorder"></g> <g id="Schedule"></g> <g id="Cart"></g> <g id="Setting"></g> <g id="Search"></g> <g id="Pencils"></g> <g id="Group"></g> <g id="Record"></g> <g id="Headphone"></g> <g id="Music_Player"></g> <g id="Sound_On"></g> <g id="Sound_Off"></g> <g id="Lock"></g> <g id="Lock_open"></g> <g id="Love"></g> <g id="Favorite"></g> <g id="Film_1_"></g> <g id="Music"></g> <g id="Puzzle"></g> <g id="Turn_Off"></g> <g id="Book"></g> <g id="Save"></g> <g id="Reload"></g> <g id="Trash"></g> <g id="Tag"></g> <g id="Link"></g> <g id="Like"></g> <g id="Bad"></g> <g id="Gallery"></g> <g id="Add"></g> <g id="Close"></g> <g id="Forward"></g> <g id="Back"></g> <g id="Buy"></g> <g id="Mac"></g> <g id="Laptop"></g> </g></svg>
  )
}

export const Dashboard=()=>{
  return (
    <svg  width="18px" height="18px" viewBox="0 0 24 24" id="meteor-icon-kit__solid-dashboard" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M2 0H7C8.10457 0 9 0.89543 9 2V7C9 8.10457 8.10457 9 7 9H2C0.89543 9 0 8.10457 0 7V2C0 0.89543 0.89543 0 2 0ZM2 11H7C8.10457 11 9 11.8954 9 13V22C9 23.1046 8.10457 24 7 24H2C0.89543 24 0 23.1046 0 22V13C0 11.8954 0.89543 11 2 11ZM13 0H22C23.1046 0 24 0.89543 24 2V13C24 14.1046 23.1046 15 22 15H13C11.8954 15 11 14.1046 11 13V2C11 0.89543 11.8954 0 13 0ZM13 17H22C23.1046 17 24 17.8954 24 19V22C24 23.1046 23.1046 24 22 24H13C11.8954 24 11 23.1046 11 22V19C11 17.8954 11.8954 17 13 17Z" fill="#0a3a75"></path></g></svg>
  )
}