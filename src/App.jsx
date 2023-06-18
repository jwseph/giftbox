import { useState, useEffect, useRef, Fragment } from 'react'
import './App.css'
import { Route, Link, Routes, useNavigate } from 'react-router-dom'
import { GoCalendar, GoGift, GoPerson, GoHistory, GoPlus } from 'react-icons/go'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function request(method, endpoint, params) {
  let url = 'https://kamiak-io.fly.dev/giftbox/'+endpoint;
  return fetch(url+'?'+new URLSearchParams(params), {method});
}
const get = (endpoint, params) => request('GET', endpoint, params);
const post = (endpoint, params) => request('POST', endpoint, params);

function formatDate(ms) {
  // Display UTC milliseconds in local time ex. "Sat, 6/10/2023" 
  let date = new Date(ms);
  return (''+date).split(' ', 2)[0]+' '+date.toLocaleDateString();
}
function formatMs(date) {
  // Convert local MM/dd/yyyy to ms
  let parts = date.trim().split('/');
  return new Date(parts[2], parts[0]-1, parts[1]).getTime();
}

function preventGoingBack() {
  history.pushState(null, document.title, location.href);
  addEventListener('popstate', function(event) {
    history.pushState(null, document.title, location.href);
  });
}

function getActiveEventId(events) {
  let now = new Date().getTime();
  for (let event_id in events) {
    const event = events[event_id];
    if (event.start_ms <= now < event.end_ms) {
      return event_id;
    }
  }
  return null;
}

function SignInPage({onPasswordChange, onSubmit}) {
  return (
    <div className='w-full max-w-sm space-y-8'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>Sign in to RGB</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>Verify your identity to continue</p>
      </div>       
      <form className="mt-8 space-y-6" onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="password" className="sr-only">Admin password</label>
            <input onChange={e => onPasswordChange(e.target.value)} id="password" name="password" type="password" autoComplete="off" className="relative block w-full rounded-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3" placeholder="Admin password (hint: happy day)"/>
          </div>
        </div>
        <div>
          <button className="w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
            Log in
          </button>
        </div>
      </form>
    </div>
  )
}

function GiftRoute({password, setGift}) {
  const navigate = useNavigate();
  const [gif, setGif] = useState();
  const confetti = useRef();
  const yay = useRef();
  useEffect(() => {
    confetti.current = new Audio('/confetti.mp3');
    yay.current = new Audio('/yay.mp3');
    preventGoingBack();
  }, [confetti, yay]);
  async function openBox() {
    let resp = await get('pick_gift', {password});
    const gift = await resp.json();
    setGift(gift);
    setGif(gift);
    confetti.current.play();
    yay.current.play();
  }
  return (
    <div className='w-full max-w-sm space-y-8 flex flex-col items-center'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>{gif ? 'Congratulations!' : 'Random Gift Box'}</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>{gif ? 'Click to claim' : 'Click to open'}</p>
      </div>
      <div>
        <button onClick={gif ? () => navigate('/claim') : openBox} className='-mt-4 flex flex-col items-center'>
          {gif && (
            <img src={gif.image} className='absolute w-28 h-28 mt-24 z-10 drop-shadow-sm rounded-md'/>
          )}
          <img src={gif ? '/giftopen.png' : '/giftclose.png'} className='drop-shadow-sm max-h-screen w-64'/>
        </button>
      </div>
      {gif ? (
        <Link to='/claim' className='w-full'>
          <button onClick={() => {}} className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
            Claim
          </button>
        </Link>
      ) : (
        <button onClick={openBox} className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
          Open
        </button>
      )}
    </div>
  )
}

function GiftWidget({gift}) {
  return (
    <div className='flex flex-col items-center bg-white shadow-sm ring-1 ring-inset ring-slate-300 rounded-md overflow-clip'>
      <img src={gift.image} className='w-32 h-32'/>
      <div className='px-3 py-2 text-sm text-slate-900 font-semibold border-t border-slate-300 w-full text-center'>{gift.name}</div>
    </div>
  )
}

function ClaimRoute({password, gift}) {
  const navigate = useNavigate();
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip_code, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [confirming, setConfirming] = useState(false);
  useEffect(() => {
    if (!gift) {
      navigate('/');
    }
    preventGoingBack();
  }, [])
  async function claimBox() {
    let resp = await post('claim_gift', {
      password, first_name, last_name, phone, email,
      address, city, state, zip_code, gift_id: gift.id,
    });
    if (!resp.ok) return;
    // Navigate to "Finished! Your gift is on the way" page
    navigate('/finished');
  }
  return (
    <div className='w-full max-w-sm space-y-8'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>
          {confirming ? 'Gift Claim Confirmation' : 'Gift Claim Form'}
        </h2>
        <p className='mt-2 text-center text-sm text-slate-600'>
          {confirming ? 'Confirm form details' : 'Complete the form below to receive your gift!'}
        </p>
      </div>
      <div className='flex flex-col items-center'>
        {gift && <GiftWidget gift={gift}/>}
      </div>
      <div>
        <form className="mt-8 space-y-6" onSubmit={(e) => {
          e.preventDefault();
          if (first_name.trim() && last_name.trim() && address.trim() && city.trim()
            && state.trim() && zip_code.trim() && phone.trim() && email.trim()) {
            setConfirming(!confirming);
          }
        }}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div className='flex flex-row -space-x-px'>
              <div className='flex-1'>
                <label htmlFor="firstName" className="sr-only">First name</label>
                <input onChange={e => setFirstName(e.target.value)} id="firstName" name="firstName" type="text" autoComplete="off" placeholder='First name' className="relative block w-full rounded-tl-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
              </div>
              <div className='flex-1'>
                <label htmlFor="lastName" className="sr-only">Last name</label>
                <input onChange={e => setLastName(e.target.value)} id="lastName" name="lastName" type="text" autoComplete="off" placeholder='Last name' className="relative block w-full rounded-tr-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Phone number</label>
              <input onChange={e => setPhone(e.target.value)} id="phone" name="phone" type="tel" autoComplete="off" placeholder='Phone number (000-000-000)' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input onChange={e => setEmail(e.target.value)} id="email" name="email" type="email" autoComplete="off" placeholder='Email address (you@example.com)' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
            </div>
          </div>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="address" className="sr-only">Shipping Address</label>
              <input onChange={e => setAddress(e.target.value)} id="address" name="address" type="text" autoComplete="off" placeholder='Shipping address' className="relative block w-full rounded-t-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
            </div>
            <div className='flex flex-row -space-x-px'>
              <div className='flex-1'>
                <label htmlFor="city" className="sr-only">City</label>
                <input onChange={e => setCity(e.target.value)} id="city" name="city" type="text" autoComplete="off" placeholder='City' className="relative block w-full rounded-bl-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
              </div>
              <div className='inline-flex flex-row -space-x-px flex-1'>
                <div className='flex-1'>
                  <label htmlFor="state" className="sr-only">State</label>
                  <input onChange={e => setState(e.target.value)} id="state" name="state" type="text" autoComplete="off" placeholder='State (WA)' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
                </div>
                <div className='flex-1'>
                  <label htmlFor="zipCode" className="sr-only">Zip code</label>
                  <input onChange={e => setZipCode(e.target.value)} id="zipCode" name="zipCode" type="text" autoComplete="off" placeholder='Zip code' className="relative block w-full rounded-br-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700" disabled={confirming} />
                </div>
              </div>
            </div>
          </div>
          <div>
            {confirming ? (
              <button className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-slate-900 bg-white hover:bg-slate-50 shadow-sm ring-1 ring-inset ring-slate-300 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
                Edit info
              </button>
            ) : (
              <button className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
                Submit
              </button>
            )}
          </div>
        </form>
          {confirming && (
            <button onClick={claimBox} className='w-full rounded-md py-2 px-3 mt-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
              Confirm
            </button>
          )}
      </div>
    </div>
  )
}

function FinishedPage({gift}) {
  useEffect(preventGoingBack, []);
  return (
    <div className='w-full max-w-sm space-y-8'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>Finished!</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>Your gift is on the way</p>
      </div>
      <div className='flex flex-col items-center'>
        <GiftWidget gift={gift}/>
      </div>
      <form className="mt-8 space-y-6" onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
        <div>
          <Link to='/'>
            <button className="w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
              Close
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}

function EventsRoute({password}) {
  const [events, setEvents] = useState({});
  const [eventName, setEventName] = useState('');
  const [eventStart, setEventStart] = useState();
  const [eventEnd, setEventEnd] = useState();
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 1000);
    return () => clearInterval(interval);
  }, [])
  async function refreshEvents() {
    let resp = await get('get_events', {password});
    setEvents(await resp.json());
  }
  function closeModal() {
    setEventName('');
    setOpen(false);
  }
  async function createEvent() {
    let resp = await post('add_event', {
      password,
      event_name: eventName,
      event_start_ms: formatMs(eventStart),
      event_end_ms: formatMs(eventEnd),
    });
    if (!resp.ok) return;
    await refreshEvents();
    closeModal();
  }
  return (
    <div className='w-full max-w-4xl min-h-full flex flex-col'>
      <div>
        <h3 className='text-left text-2xl font-bold tracking-tight text-slate-900 py-2'>Random Gift Box Manager</h3>
      </div>
      <div className='border-b border-slate-300'>
        <nav className='flex -mb-px space-x-8'>
          <Link to='/manager/events' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-indigo-600 font-medium border-b-2 border-indigo-500 whitespace-nowrap'>
            <GoCalendar className='w-5 h-5'/>
            <div>Events</div>
          </Link>
          <Link to='/manager/gifts' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoGift className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Gifts</div>
          </Link>
          <Link to='/manager/claims' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoPerson className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Claims</div>
          </Link>
          <Link to='/manager/report' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoHistory className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Report</div>
          </Link>
        </nav>
      </div>
      <div className='w-full space-y-8 flex-1 inline-flex flex-col justify-center py-12 sm:py-6'>

        <div>
          <button onClick={() => setOpen(true)} className="flex flex-row justify-center gap-1.5 w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
            <GoPlus className='w-5 h-5'/>
            <div>New event</div>
          </button>
        </div>

        <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
          <table className="table-fixed bg-white text-sm w-full">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                <th className="text-left py-4 px-6 w-3/12">Event name</th>
                <th className="text-left py-4 pr-6 w-3/12">Start date</th>
                <th className="text-left py-4 pr-6 w-3/12">End date</th>
                <th className="text-left py-4 pr-6 w-1/12">Gifts</th>
                <th className="text-left py-4 pr-6 w-2/12"></th>
              </tr>
            </thead>
            <tbody>
              {
                Object.keys(events).map(function(event_id, index) {
                  let event = events[event_id];
                  let availableGifts = 0, totalGifts = 0;
                  for (const gift of Object.values(event.gifts)) {
                    if (gift.quantity) availableGifts++;
                    totalGifts++;
                  }
                  return (
                    <tr className="border-b border-slate-200 last:border-b-0" key={index}>
                      <td className="py-4 px-6 font-semibold truncate">{event.name}</td>
                      <td className="py-4 pr-6 text-slate-600">{formatDate(event.start_ms)}</td>
                      <td className="py-4 pr-6 text-slate-600">{formatDate(event.end_ms)}</td>
                      <td className="py-4 pr-6 text-slate-600">{availableGifts+' / '+totalGifts}</td>
                      <td className="py-4 pr-6 text-slate-600 text-right">
                        <span
                          className="font-semibold text-indigo-600 hover:text-indigo-500 active:text-indigo-500 cursor-pointer select-none"
                          onClick={async () => {
                            await post('delete_event', {password, event_id});
                            delete events[event_id];
                            setEvents({...events});
                            select(null);
                            await refreshEvents();
                          }}
                        >
                          Delete
                        </span>
                      </td>
                    </tr>
                  )
                })
              }
              {Object.keys(events).length == 0 && (
                <tr className="border-b border-slate-200 last:border-b-0">
                  <td className="py-4 pl-6 text-slate-600 text-left">No events available</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>


      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          
                  <div className='bg-white px-6 py-6'>

                    <h3 className='text-center text-base font-semibold text-slate-900'>New event</h3>
                    <p className='mt-2 text-center text-sm text-slate-500'>Enter an event name and a date range [start, end)</p>


                    <form className="mt-6 space-y-6" onSubmit={(e) => {
                      e.preventDefault();
                    }}>
                      <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                          <label htmlFor="eventName" className="sr-only">Event name</label>
                          <input onChange={e => setEventName(e.target.value)} id="eventName" name="eventName" type="text" autoComplete="off" placeholder='Event name' className="relative block w-full rounded-t-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                        <div>
                          <label htmlFor="eventStart" className="sr-only">Start date</label>
                          <input onChange={e => setEventStart(e.target.value)} id="eventStart" name="eventStart" type="text" autoComplete="off" placeholder='Start date (MM/dd/yyyy)' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                        <div>
                          <label htmlFor="eventEnd" className="sr-only">End date</label>
                          <input onChange={e => setEventEnd(e.target.value)} id="eventEnd" name="eventEnd" type="text" autoComplete="off" placeholder='End date (MM/dd/yyyy)' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                      </div>
                      <div>

                      <div className='flex flex-row gap-3'>
                        <button
                          type="button"
                          className="flex-1 flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600"
                          onClick={closeModal}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                        <button onClick={createEvent} className="flex-1 flex flex-row justify-center gap-1.5 w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
                          Create
                        </button>
                      </div>


                      </div>
                    </form>

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

function GiftsRoute({password, updateSelected, initialSelected}) {
  const [events, setEvents] = useState();
  const [selected, setSelected] = useState(initialSelected);
  const [gift_name, setGiftName] = useState('');
  const [gift_image, setGiftImage] = useState();
  const [gift_points, setGiftPoints] = useState(0);
  const [gift_quantity, setGiftQuantity] = useState(0);
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 1000);
    return () => clearInterval(interval);
  }, [events, selected])
  async function refreshEvents() {
    let resp = await get('get_events', {password});
    const res = await resp.json();
    for (let eventId in res) {
      res[eventId].id = eventId;
    }
    if (!selected || !(selected in res)) {
      select(getActiveEventId(res) ?? Object.keys(res)[0]);
    }
    setEvents(res);
  }
  function closeModal() {
    setGiftName('');
    setOpen(false);
  }
  async function createGift() {
    let resp = await post('add_gift', {
      password,
      event_id: selected,
      gift_name,
      gift_image,
      gift_points,
      gift_quantity,
    });
    if (!resp.ok) return;
    await refreshEvents();
    closeModal();
  }
  function select(eventId) {
    setSelected(eventId);
    updateSelected(eventId);
  }
  return (
    <div className='w-full max-w-4xl min-h-full flex flex-col'>
      <div>
        <h3 className='text-left text-2xl font-bold tracking-tight text-slate-900 py-2'>Random Gift Box Manager</h3>
      </div>
      <div className='border-b border-slate-300'>
        <nav className='flex -mb-px space-x-8'>
          <Link to='/manager/events' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoCalendar className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Events</div>
          </Link>
          <Link to='/manager/gifts' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-indigo-600 font-medium border-b-2 border-indigo-500 whitespace-nowrap'>
            <GoGift className='w-5 h-5'/>
            <div>Gifts</div>
          </Link>
          <Link to='/manager/claims' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoPerson className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Claims</div>
          </Link>
          <Link to='/manager/report' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoHistory className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Report</div>
          </Link>
        </nav>
      </div>
      
      <div className='w-full space-y-8 flex-1 inline-flex flex-col justify-center py-12 sm:py-6'>
        {selected && events && (
          <div className='space-y-4'>
            <div>
              <Listbox value={events[selected]} onChange={(event) => select(event.id)}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Selected event:</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="block truncate">{`${events[selected].name} (${formatDate(events[selected].start_ms)} - ${formatDate(events[selected].end_ms)})`}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {Object.keys(events).map((eventId) => (
                            <Listbox.Option
                              key={eventId}
                              className={({active}) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={events[eventId]}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}
                                    >
                                      {`${events[eventId].name} (${formatDate(events[eventId].start_ms)} - ${formatDate(events[eventId].end_ms)})`}
                                    </span>
                                  </div>

                                  {selected && events && (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>

            <div>
              <button onClick={() => setOpen(true)} className="flex flex-row justify-center gap-1.5 w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
                <GoPlus className='w-5 h-5'/>
                <div>Add gift</div>
              </button>
            </div>
          </div>
        )}

        {selected && events && Object.keys(events[selected].gifts).length ? (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-6/12">Gift</th>
                  <th className="text-left py-4 pr-6 w-2/12">Points</th>
                  <th className="text-left py-4 pr-6 w-2/12">Quantity</th>
                  <th className="text-left py-4 pr-6 w-2/12"></th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.keys(events[selected].gifts).map(function(gift_id, index) {
                    let gift = events[selected].gifts[gift_id];
                    return (
                      <tr className="border-b border-slate-200 last:border-b-0" key={index}>
                        <td className="py-4 px-6 font-semibold truncate">
                          <div className='flex items-center gap-4'>
                            <img src={gift.image} className='aspect-square h-6'/>
                            <span>{gift.name}</span>
                          </div>
                        </td>
                        <td className="py-4 pr-6 text-slate-600">{gift.points}</td>
                        <td className="py-4 pr-6 text-slate-600">{gift.quantity}</td>
                        <td className="py-4 pr-6 text-slate-600 text-right">
                          <span
                            className="font-semibold text-indigo-600 hover:text-indigo-500 active:text-indigo-500 cursor-pointer select-none"
                            onClick={async () => {
                              await post('delete_gift', {password, event_id: selected, gift_id});
                              await refreshEvents();
                            }}
                          >
                            Delete
                          </span>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-6/12">Gift</th>
                  <th className="text-left py-4 pr-6 w-2/12">Points</th>
                  <th className="text-left py-4 pr-6 w-2/12">Quantity</th>
                  <th className="text-left py-4 pr-6 w-2/12"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 last:border-b-0">
                  <td className="py-4 pl-6 text-slate-600 text-left">No gifts available</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>


      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          
                  <div className='bg-white px-6 py-6'>

                    <h3 className='text-center text-base font-semibold text-slate-900'>Add gift</h3>
                    <p className='mt-2 text-center text-sm text-slate-500'>Enter the gift's name, image url, and quantity</p>


                    <form className="mt-6 space-y-6" onSubmit={(e) => {
                      e.preventDefault();
                    }}>
                      <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                          <label htmlFor="giftName" className="sr-only">Gift name</label>
                          <input onChange={e => setGiftName(e.target.value)} id="giftName" name="giftName" type="text" autoComplete="off" placeholder='Gift name' className="relative block w-full rounded-t-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                        <div>
                          <label htmlFor="giftImage" className="sr-only">Gift image url</label>
                          <input onChange={e => setGiftImage(e.target.value)} id="giftImage" name="giftImage" type="text" autoComplete="off" placeholder='Gift image url' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                        <div>
                          <label htmlFor="giftPoints" className="sr-only">Gift points (relative probability)</label>
                          <input onChange={e => setGiftPoints(+e.target.value)} id="giftPoints" name="giftPoints" type="text" autoComplete="off" placeholder='Gift points (relative probability)' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                        <div>
                          <label htmlFor="giftQuantity" className="sr-only">Gift quantity</label>
                          <input onChange={e => setGiftQuantity(+e.target.value)} id="giftQuantity" name="giftQuantity" type="text" autoComplete="off" placeholder='Gift quantity' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3 disabled:text-slate-700"/>
                        </div>
                      </div>
                      <div>

                      <div className='flex flex-row gap-3'>
                        <button
                          type="button"
                          className="flex-1 flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600"
                          onClick={closeModal}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                        <button onClick={createGift} className="flex-1 flex flex-row justify-center gap-1.5 w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600">
                          Create
                        </button>
                      </div>


                      </div>
                    </form>

                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

function ClaimsRoute({password, updateSelected, initialSelected}) {
  const [events, setEvents] = useState();
  const [selected, setSelected] = useState(initialSelected);
  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 1000);
    return () => clearInterval(interval);
  }, [events, selected])
  async function refreshEvents() {
    let resp = await get('get_events', {password});
    const res = await resp.json();
    for (let eventId in res) {
      res[eventId].id = eventId;
    }
    setEvents(res);
    if (!selected || !(selected in res)) {
      select(getActiveEventId(res) ?? Object.keys(res)[0]);
    }
  }
  function select(eventId) {
    setSelected(eventId);
    updateSelected(eventId);
  }
  return (
    <div className='w-full max-w-4xl min-h-full flex flex-col'>
      <div>
        <h3 className='text-left text-2xl font-bold tracking-tight text-slate-900 py-2'>Random Gift Box Manager</h3>
      </div>
      <div className='border-b border-slate-300'>
        <nav className='flex -mb-px space-x-8'>
          <Link to='/manager/events' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoCalendar className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Events</div>
          </Link>
          <Link to='/manager/gifts' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoGift className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Gifts</div>
          </Link>
          <Link to='/manager/claims' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-indigo-600 font-medium border-b-2 border-indigo-500 whitespace-nowrap'>
            <GoPerson className='w-5 h-5'/>
            <div>Claims</div>
          </Link>
          <Link to='/manager/report' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoHistory className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Report</div>
          </Link>
        </nav>
      </div>
      
      <div className='w-full space-y-8 flex-1 inline-flex flex-col justify-center py-12 sm:py-6'>
        {selected && events && (
          <div className='space-y-4'>
            <div>
              <Listbox value={events[selected]} onChange={(event) => select(event.id)}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Selected event:</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="block truncate">{`${events[selected].name} (${formatDate(events[selected].start_ms)} - ${formatDate(events[selected].end_ms)})`}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {Object.keys(events).map((eventId) => (
                            <Listbox.Option
                              key={eventId}
                              className={({active}) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={events[eventId]}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}
                                    >
                                      {`${events[eventId].name} (${formatDate(events[eventId].start_ms)} - ${formatDate(events[eventId].end_ms)})`}
                                    </span>
                                  </div>

                                  {selected && events && (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
          </div>
        )}

        {selected && events && Object.values(events[selected].claims).filter(claim => !claim.claimed).length ? (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-3/12">Name</th>
                  <th className="text-left py-4 pr-6 w-2/12">Phone</th>
                  <th className="text-left py-4 pr-6 w-2/12">Email</th>
                  <th className="text-left py-4 pr-6 w-4/12">Address</th>
                  <th className="text-left py-4 pr-6 w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.keys(events[selected].claims).filter(claim_id => !events[selected].claims[claim_id].claimed).map(function(claim_id, index) {
                    let claim = events[selected].claims[claim_id];
                    return (
                      <tr className="border-b border-slate-200 last:border-b-0" key={index}>
                        <td className="py-4 px-6 font-semibold truncate">{claim.first_name} {claim.last_name}</td>
                        <td className="py-4 pr-6 text-slate-600">{claim.phone}</td>
                        <td className="py-4 pr-6 text-slate-600 truncate">{claim.email}</td>
                        <td className="py-4 pr-6 text-slate-600 truncate">{claim.address}, {claim.city}, {claim.state} {claim.zip_code}</td>
                        <td className="py-4 pr-6 text-slate-600 text-right">
                          <span
                            className="font-semibold text-indigo-600 hover:text-indigo-500 active:text-indigo-500 cursor-pointer select-none"
                            onClick={async () => {
                              // alert('Coming soon!');
                              await post('update_claim', {password, event_id: selected, claim_id});
                              await refreshEvents();
                            }}
                          >
                            Update
                          </span>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-3/12">Name</th>
                  <th className="text-left py-4 pr-6 w-2/12">Phone</th>
                  <th className="text-left py-4 pr-6 w-2/12">Email</th>
                  <th className="text-left py-4 pr-6 w-4/12">Address</th>
                  <th className="text-left py-4 pr-6 w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 last:border-b-0">
                  <td className="py-4 pl-6 text-slate-600 text-left">No claims available</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}

function ReportRoute({password, updateSelected, initialSelected}) {
  const [events, setEvents] = useState();
  const [selected, setSelected] = useState(initialSelected);
  useEffect(() => {
    refreshEvents();
    const interval = setInterval(refreshEvents, 1000);
    return () => clearInterval(interval);
  }, [events, selected])
  async function refreshEvents() {
    let resp = await get('get_events', {password});
    const res = await resp.json();
    for (let eventId in res) {
      res[eventId].id = eventId;
    }
    setEvents(res);
    if (!selected || !(selected in res)) {
      select(getActiveEventId(res) ?? Object.keys(res)[0]);
    }
  }
  function select(eventId) {
    setSelected(eventId);
    updateSelected(eventId);
  }
  return (
    <div className='w-full max-w-4xl min-h-full flex flex-col'>
      <div>
        <h3 className='text-left text-2xl font-bold tracking-tight text-slate-900 py-2'>Random Gift Box Manager</h3>
      </div>
      <div className='border-b border-slate-300'>
        <nav className='flex -mb-px space-x-8'>
          <Link to='/manager/events' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoCalendar className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Events</div>
          </Link>
          <Link to='/manager/gifts' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoGift className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Gifts</div>
          </Link>
          <Link to='/manager/claims' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-slate-600 hover:text-slate-800 font-medium border-transparent border-b-2 hover:border-slate-400 whitespace-nowrap'>
            <GoPerson className='w-5 h-5 text-slate-500 group-hover:text-slate-600'/>
            <div>Claims</div>
          </Link>
          <Link to='/manager/report' className='group flex flex-row items-center space-x-1.5 px-1 py-4 text-sm text-indigo-600 font-medium border-b-2 border-indigo-500 whitespace-nowrap'>
            <GoHistory className='w-5 h-5'/>
            <div>Report</div>
          </Link>
        </nav>
      </div>
      
      <div className='w-full space-y-8 flex-1 inline-flex flex-col justify-center py-12 sm:py-6'>
        {selected && events && (
          <div className='space-y-4'>
            <div>
              <Listbox value={events[selected]} onChange={(event) => select(event.id)}>
                {({ open }) => (
                  <>
                    <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Selected event:</Listbox.Label>
                    <div className="relative mt-2">
                      <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                        <span className="block truncate">{`${events[selected].name} (${formatDate(events[selected].start_ms)} - ${formatDate(events[selected].end_ms)})`}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {Object.keys(events).map((eventId) => (
                            <Listbox.Option
                              key={eventId}
                              className={({active}) =>
                                classNames(
                                  active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                                  'relative cursor-default select-none py-2 pl-3 pr-9'
                                )
                              }
                              value={events[eventId]}
                            >
                              {({ selected, active }) => (
                                <>
                                  <div className="flex items-center">
                                    <span
                                      className={classNames(selected ? 'font-semibold' : 'font-normal', 'block truncate')}
                                    >
                                      {`${events[eventId].name} (${formatDate(events[eventId].start_ms)} - ${formatDate(events[eventId].end_ms)})`}
                                    </span>
                                  </div>

                                  {selected && events && (
                                    <span
                                      className={classNames(
                                        active ? 'text-white' : 'text-indigo-600',
                                        'absolute inset-y-0 right-0 flex items-center pr-4'
                                      )}
                                    >
                                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            </div>
          </div>
        )}

        {selected && events && Object.keys(events[selected].claims).length ? (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-3/12">Name</th>
                  <th className="text-left py-4 pr-6 w-2/12">Phone</th>
                  <th className="text-left py-4 pr-6 w-2/12">Email</th>
                  <th className="text-left py-4 pr-6 w-4/12">Address</th>
                  <th className="text-left py-4 pr-6 w-1/12">Given?</th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.keys(events[selected].claims).map(function(claim_id, index) {
                    let claim = events[selected].claims[claim_id];
                    return (
                      <tr className="border-b border-slate-200 last:border-b-0" key={index}>
                        <td className="py-4 px-6 font-semibold truncate">{claim.first_name} {claim.last_name}</td>
                        <td className="py-4 pr-6 text-slate-600">{claim.phone}</td>
                        <td className="py-4 pr-6 text-slate-600 truncate">{claim.email}</td>
                        <td className="py-4 pr-6 text-slate-600 truncate">{claim.address}, {claim.city}, {claim.state} {claim.zip_code}</td>
                        <td className="py-4 pr-6 text-slate-600">{claim.claimed ? 'Yes' : 'No'}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-slate-300 rounded-lg overflow-hidden shadow-sm text-slate-900">
            <table className="table-fixed bg-white text-sm w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 rounded-tl-lg">
                  <th className="text-left py-4 px-6 w-3/12">Name</th>
                  <th className="text-left py-4 pr-6 w-2/12">Phone</th>
                  <th className="text-left py-4 pr-6 w-2/12">Email</th>
                  <th className="text-left py-4 pr-6 w-4/12">Address</th>
                  <th className="text-left py-4 pr-6 w-1/12">Given?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 last:border-b-0">
                  <td className="py-4 pl-6 text-slate-600 text-left">Nothing available</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}

export default function App() {
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [gift, setGift] = useState();
  const [selected, setSelected] = useState(null);
  return (
    <div className='flex flex-col min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100'>
      {!signedIn ? (
        <SignInPage
          onPasswordChange={setPassword}
          onSubmit={async () => {
            let resp = await get('get_events', {password});
            setSignedIn(resp.ok);
          }}
        />
      ) : (
        <Routes>
          <Route path='/' element={<GiftRoute password={password} setGift={setGift}/>}/>
          <Route path='/manager' element={<EventsRoute password={password}/>}/>
          <Route path='/manager/events' element={<EventsRoute password={password}/>}/>
          <Route path='/manager/gifts' element={<GiftsRoute password={password} updateSelected={setSelected} initialSelected={selected}/>}/>
          <Route path='/manager/claims' element={<ClaimsRoute password={password} updateSelected={setSelected} initialSelected={selected}/>}/>
          <Route path='/manager/report' element={<ReportRoute password={password} updateSelected={setSelected} initialSelected={selected}/>}/>
          <Route path='/claim' element={<ClaimRoute password={password} gift={gift}/>}/>
          <Route path='/finished' element={<FinishedPage gift={gift}/>}/>
        </Routes>
      )}
    </div>
  )
}