import { createWithRemoteLoader } from '@kne/remote-loader';
import classnames from 'classnames';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import dayjs from 'dayjs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import scrollGridPlugin from '@fullcalendar/scrollgrid';
import useResize from '@kne/use-resize';
import style from './style.module.scss';

const Calendar = createWithRemoteLoader({
  modules: ['components-core:Tooltip']
})(
  forwardRef(({ remoteModules, className, ...p }, apiRef) => {
    const [Tooltip] = remoteModules;
    const calendarRef = useRef();
    const ref = useResize(() => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.updateSize();
      }
    });
    useImperativeHandle(apiRef, () => {
      return calendarRef.current.getApi();
    });
    const props = Object.assign(
      {},
      {
        plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin, scrollGridPlugin],
        initialView: 'dayGridMonth',
        aspectRatio: 1.6,
        weekends: true,
        slotEventOverlap: false,
        displayEventEnd: true,
        editable: false,
        firstDay: 1,
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
        buttonText: {
          today: '今天',
          month: '月',
          week: '周',
          day: '天'
        },
        dayMinWidth: 100,
        locale: 'zh-cn',
        height: 'auto',
        handleWindowResize: false,
        dateClick: () => {},
        eventClick: () => {},
        eventContent: ({ event }) => {
          const startStr = event.start ? dayjs(event.start).format('HH:ss') : '',
            endStr = event.end ? dayjs(event.end).format('HH:ss') : '';
          const content = `${!(startStr && endStr) ? `[${startStr}]` : startStr === endStr ? '' : `[${startStr}-${endStr}]`} ${event.title}`;

          return <Tooltip content={content}>{content}</Tooltip>;
        },
        initialDate: dayjs().format('YYYY-MM-DD')
      },
      p
    );
    return (
      <div className={classnames(style['calendar'], className)} ref={ref}>
        <FullCalendar {...props} ref={calendarRef} />
      </div>
    );
  })
);

export default Calendar;
