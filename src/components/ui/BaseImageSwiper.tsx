import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper'; // Import type của Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export type BaseImageSwiperNavigationType = 'prev' | 'next';

export type BaseImageSwiperNavigationEvent = {
  action: BaseImageSwiperNavigationType;
  activeSlideIndex: number;
};

type BaseImageSwiperProps = React.ComponentProps<typeof Swiper> & {
  contents: ReactNode[];
  hasGoToSlide?: boolean;
  isAutoPlay?: boolean;
  onGoToSlide?: (event: BaseImageSwiperNavigationEvent) => void;
  onSlideClick?: (event: number) => void;
};

export default function BaseImageSwiper({
  contents,
  hasGoToSlide = false,
  isAutoPlay = true,
  onGoToSlide,
  onSlideClick,
  ...props
}: BaseImageSwiperProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // const handleOnMouseEnter = () => {
  //   swiperRef.current?.autoplay.stop();
  // };

  // const handleOnMouseLeave = () => {
  //   swiperRef.current?.autoplay.start();
  // };

  const handleOnGoToSlide = (action: BaseImageSwiperNavigationType) => {
    let newIndex = activeSlideIndex;

    if (action === 'next') {
      newIndex =
        activeSlideIndex >= contents.length - 1 ? 0 : activeSlideIndex + 1;
    } else {
      newIndex =
        activeSlideIndex <= 0 ? contents.length - 1 : activeSlideIndex - 1;
    }

    setActiveSlideIndex(newIndex);

    swiperRef.current?.slideTo(newIndex, 1000);

    onGoToSlide?.({
      action,
      activeSlideIndex: newIndex,
    });
  };

  const handleSlideClick = (index: number) => {
    onSlideClick?.(index);
  };

  return (
    <div className="relative w-full cursor-pointer">
      <Swiper
        {...props}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        modules={[Pagination, Navigation, ...(isAutoPlay ? [Autoplay] : [])]}
        navigation={{
          prevEl: '.custom-prev',
          nextEl: '.custom-next',
        }}
      >
        {contents.map((content, index) => (
          <SwiperSlide key={index} onClick={() => handleSlideClick(index)}>
            {content}
          </SwiperSlide>
        ))}
      </Swiper>
      {!hasGoToSlide && (
        <>
          <button className="custom-prev" type="button">
            <ChevronLeft size={32} />
          </button>

          <button className="custom-next">
            <ChevronRight size={32} />
          </button>
        </>
      )}
      {hasGoToSlide && (
        <>
          <button
            onClick={() => handleOnGoToSlide('prev')}
            className="top-1/2 -left-2.5 z-[300] absolute flex justify-center items-center bg-black/60 hover:bg-black/85 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-lg w-9 h-[52px] text-white hover:scale-[1.08] transition-all -translate-y-1/2 hover:-translate-y-1/2 duration-300 ease-out cursor-pointer"
            type="button"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={() => handleOnGoToSlide('next')}
            className="top-1/2 -right-2.5 z-[300] absolute flex justify-center items-center bg-black/60 hover:bg-black/85 backdrop-blur-sm border border-white/20 hover:border-white/40 rounded-lg w-9 h-[52px] text-white hover:scale-[1.08] transition-all -translate-y-1/2 hover:-translate-y-1/2 duration-300 ease-out cursor-pointer"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>
  );
}
