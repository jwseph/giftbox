import { useState } from 'react'
import './App.css'
import { Route, Link, Routes, useNavigate } from 'react-router-dom'

const ENDPOINT = 'https://kamiak-io.fly.dev/giftbox/';
const eventId = '0c0147a5b1f04505bb8972bd11fc8cb5';

function SignInPage({onPasswordChange, onSubmit}) {
  return (
    <div className='w-full max-w-md space-y-8'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>Sign in to RGB Manager</h2>
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

function AdminRoute() {
  return (
    <div>
      Admin page
    </div>
  )
}

function GiftRoute({password, setGiftId}) {
  const [open, setOpen] = useState(false);
  async function openBox() {
    let resp = await fetch(ENDPOINT+'pick_gift?password='+password);
    setGiftId(await resp.json());
    setOpen(true);
  }
  return (
    <div className='w-full max-w-md space-y-8 flex flex-col items-center'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>{open ? 'Congratulations!' : 'Random Gift Box'}</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>{open ? 'Click to claim' : 'Click to open'}</p>
      </div>
      <button onClick={openBox} disabled={open}>
        <img src={open ? '/giftopen.png' : '/giftclose.png'} className='drop-shadow-sm max-h-screen w-64'/>
      </button>
      {open ? (
        <Link to='/claim'>
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

function ClaimRoute({password, giftId}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className='w-full max-w-md space-y-8'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>Gift Claim Form</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>Fill out the form below to receive your gift!</p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="firstName" className="sr-only">First name</label>
            <input onChange={e => setFirstName(e.target.value)} id="firstName" name="firstName" type="text" autoComplete="off" placeholder='Enter first name' className="relative block w-full rounded-t-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="lastName" className="sr-only">Last name</label>
            <input onChange={e => setLastName(e.target.value)} id="lastName" name="lastName" type="text" autoComplete="off" placeholder='Enter last name' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="phone" className="sr-only">Phone number</label>
            <input onChange={e => setPhone(e.target.value)} id="phone" name="phone" type="tel" autoComplete="off" placeholder='Enter phone number' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input onChange={e => setEmail(e.target.value)} id="email" name="email" type="email" autoComplete="off" placeholder='Enter email address' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
        </div>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="address" className="sr-only">Shipping Address</label>
            <input onChange={e => setAddress(e.target.value)} id="address" name="address" type="text" autoComplete="off" placeholder='Enter shipping address' className="relative block w-full rounded-t-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="city" className="sr-only">City</label>
            <input onChange={e => setCity(e.target.value)} id="city" name="city" type="text" autoComplete="off" placeholder='Enter city' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="state" className="sr-only">State</label>
            <input onChange={e => setState(e.target.value)} id="state" name="state" type="text" autoComplete="off" placeholder='Enter state' className="relative block w-full border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
          <div>
            <label htmlFor="zip" className="sr-only">Zip code</label>
            <input onChange={e => setZip(e.target.value)} id="zip" name="zip" type="text" autoComplete="off" placeholder='Enter zip code' className="relative block w-full rounded-b-md border-0 py-1.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"/>
          </div>
        </div>
        <div>
          <button onClick={() => console.log('Claim submit')} className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [password, setPassword] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [giftId, setGiftId] = useState();
  return (
    <div className='flex flex-col min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100'>
      {!signedIn ? (
        <SignInPage
          onPasswordChange={setPassword}
          onSubmit={async () => {
            let resp = await fetch(ENDPOINT+'get_events?password='+password);
            setSignedIn(resp.ok);
          }}
        />
      ) : (
      <Routes>
        <Route path='/' element={<GiftRoute password={password} setGiftId={setGiftId}/>}/>
        <Route path='/admin' element={<AdminRoute/>}/>
        <Route path='/claim' element={<ClaimRoute/>}/>
      </Routes>
      )}
    </div>
  )
}

export default App