/**
 * Simple & Clean Wedding Invitation Configuration
 *
 * 이 파일에서 청첩장의 모든 정보를 수정할 수 있습니다.
 * 스토리/갤러리 이미지는 아래 목록에 등록된 파일만 로드합니다.
 * 목록을 명시하면 존재하지 않는 파일을 반복 요청하지 않아 로딩이 빨라집니다.
 *
 * 이미지 폴더 구조:
 *   images/hero/1.jpg      - 메인 사진 (1장, 필수)
 *   images/story/*.jpg     - 스토리 사진
 *   images/gallery/*       - 갤러리 사진
 *   images/location/1.jpg  - 약도/지도 이미지 (1장)
 *   images/og/1.jpg        - 카카오톡 공유 썸네일 (1장)
 *   audio/1.mp3            - 배경음악
 */

const CONFIG = {
  // ── 이미지 목록 ──
  // 갤러리는 모바일 전송량을 줄이기 위해 최적화된 WebP를 사용합니다.
  images: {
    story: ["1.jpg", "2.jpg"],
    gallery: [
      "optimized/1.webp",
      "optimized/2.webp",
      "optimized/3.webp",
      "optimized/4.webp",
      "optimized/5.webp",
      "optimized/6.webp",
      "optimized/7.webp",
      "optimized/8.webp",
      "optimized/11.webp",
      "optimized/12.webp",
      "optimized/13.webp",
      "optimized/14.webp",
    ],
  },

  // ── 초대장 열기 ──
  useCurtain: true, // 초대장 열기 화면 사용 여부 (true: 사용, false: 바로 본문 표시)

  // ── 배경음악 ──
  bgm: {
    src: "audio/1.mp3",
    enabled: true,
  },

  // ── 메인 (히어로) ──
  groom: {
    name: "백두한",
    father: "백주원",
    mother: "박윤주",
    fatherDeceased: true,
    motherDeceased: false,
  },

  bride: {
    name: "박지현",
    father: "박상규",
    mother: "이순여",
    fatherDeceased: false,
    motherDeceased: false,
  },

  wedding: {
    date: "2026-11-21",
    time: "12:10",
    venue: "웨스턴베니비스 신도림",
    hall: "7층 아스타홀",
    address: "서울 구로구 새말로 97 신도림테크노마트",
    tel: "02-2111-7000",
    mapLinks: {
      kakao: "https://place.map.kakao.com/18887815",
      naver: "https://naver.me/53lK4SBz",
    },
  },

  // ── 인사말 ──
  greeting: {
    title: "소중한 분들을 초대합니다",
    content:
      "서로의 하루가 되어주고 싶은 사람을 만나\n웃음이 더 많아졌습니다.\n\n좋아하는 마음을 차곡차곡 모아\n이제는 한 가족이 되려 합니다.\n\n설레는 첫 걸음에 따뜻한 축복을 부탁드립니다.",
  },

  // ── 오시는 길 ──
  // (mapLinks는 wedding 객체 내에 포함)

  // ── 마음 전하실 곳 ──
  accounts: {
    groom: [
      {
        role: "신랑",
        name: "백두한",
        bank: "토스뱅크",
        number: "1001-9325-1906",
      },
      {
        role: "어머니",
        name: "박윤주",
        bank: "하나은행",
        number: "354-910028-69207",
      },
    ],
    bride: [
      {
        role: "신부",
        name: "박지현",
        bank: "카카오뱅크",
        number: "3333-22-1072698",
      },
      {
        role: "아버지",
        name: "박상규",
        bank: "신한은행",
        number: "110-000-866307",
      },
      {
        role: "어머니",
        name: "이순여",
        bank: "우리은행",
        number: "1002-248-007654",
      },
    ],
  },

  // ── 링크 공유 시 나타나는 문구 ──
  meta: {
    title: "백두한 ♥ 박지현 결혼합니다",
    description: "2026년 11월 21일, 소중한 분들을 초대합니다.",
  },
};
