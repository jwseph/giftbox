import { useState } from 'react'
import './App.css'
import { Route, Link, Routes, useNavigate } from 'react-router-dom'

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
  const [password, setPassword] = useState('');
  return (
    <SignInPage
      onPasswordChange={setPassword}
      onSubmit={async()=>{
        console.log('password submitted: '+password);
      }}
    />
  )
}

function GiftRoute() {
  const [open, setOpen] = useState(false);
  return (
    <div className='w-full max-w-md space-y-8 flex flex-col items-center'>
      <div>
        <h2 className='text-center text-3xl font-bold tracking-tight text-slate-900'>Random Gift Box</h2>
        <p className='mt-2 text-center text-sm text-slate-600'>click to open</p>
      </div>
      <button onClick={() => setOpen(!open)}>
        <img src={open ? '/giftopen.png' : '/giftclose.png'} className='drop-shadow-sm max-h-screen w-64'/>
      </button>
      <button className='w-full rounded-md py-2 px-3 text-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus-visible:outline outline-2 outline-offset-2 outline-indigo-600'>
        Open
      </button>
    </div>
  )
}

function App() {
  return (
    <div className='flex flex-col min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100'>
      <Routes>
        <Route path='/' element={<GiftRoute/>}/>
        <Route path='/admin' element={<AdminRoute/>}/>
      </Routes>
    </div>
  )
}

export default App