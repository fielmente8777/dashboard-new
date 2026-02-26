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

const DocumentIcon = ({ size = 16, color = "#000000", ...props }) => {
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

export default DocumentIcon;

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
