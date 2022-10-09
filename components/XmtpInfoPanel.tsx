import packageJson from '../package.json'
import { classNames } from '../helpers'
import {
  LinkIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChevronRightIcon,
  ArrowSmRightIcon,
} from '@heroicons/react/solid'
import { WalletContext } from '../contexts/wallet'
import { useContext, useEffect, useState } from 'react'
import QRCode from "react-qr-code";
import io from 'socket.io-client'
import { createClient } from '@supabase/supabase-js'
import Address from './Address'

let socket

const VERIFIER_ENDPOINT = process.env.NEXT_PUBLIC_VERIFIER_ENDPOINT
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabaseUrl = 'https://oskbyxzffucaainswhzk.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
{/* @ts-ignore */ }
const supabase = createClient(supabaseUrl, SUPABASE_KEY)

type XmtpInfoRowProps = {
  icon: JSX.Element
  headingText: string
  subHeadingText: string
  onClick?: (() => void) | (() => Promise<void>)
  disabled?: boolean
}

type XmtpInfoPanelProps = {
  onConnect?: () => Promise<void>
}


const InfoRow = ({
  icon,
  headingText,
  subHeadingText,
  onClick,
  disabled,
}: XmtpInfoRowProps): JSX.Element => (
  <a
    onClick={disabled ? undefined : onClick}
    className={disabled ? 'cursor-auto' : 'cursor-pointer'}
  >
    <div
      className={classNames(
        disabled ? 'opacity-40' : '',
        'flex py-4 border border-x-0 border-y-zinc-50 justify-between items-stretch text-left'
      )}
    >
      <div className="h-10 w-10 bg-l-300 rounded-lg text-white p-2">{icon}</div>
      <div className="ml-3 flex-col justify-center text-md flex-1">
        <div className="font-semibold text-n-600">{headingText}</div>
        <div className="text-n-300">{subHeadingText}</div>
      </div>
      <div className="w-10 flex justify-end items-center pr-2">
        <ChevronRightIcon className="h-5" />
      </div>
    </div>
  </a>
)

const XmtpInfoPanel = ({ onConnect }: XmtpInfoPanelProps): JSX.Element => {
  const { address: walletAddress } = useContext(WalletContext)
  const [qrData, setqrData] = useState("")
  const [pid, setPID] = useState({}) // set polygon id
  const [disabled, setDisabled] = useState(false)

  useEffect(() =>  {
    const update = async () => {
      await updateMap()
    }
    update()
  }, [walletAddress])

  const updateMap = async () => {
    /* @ts-ignore */
    if (walletAddress && pid.pid) {
      const { data, error } = await supabase
        .from('eth-pid-map')
        .upsert(
          /* @ts-ignore */ 
          { id: pid.id, polygon_id: pid.pid, eth_address: walletAddress}
        )

      console.log(data)
      console.log(error)
    }
  }

  const mySubscription = supabase
    .from('eth-pid-map')
    .on('INSERT', payload => {
      console.log('Change received!', payload)
      if (payload.new.polygon_id !== null) {
        alert(payload.new.polygon_id)
        setPID({pid: payload.new.polygon_id, id: payload.new.id})
        setDisabled(false)
      }
    })
    .subscribe()

  {/* @ts-ignore */ }

  /*
  useEffect(() => socketInitializer(), [])
  const socketInitializer = async () => {
    socket = io("http://localhost:8080")

    socket.on('connect', () => {
      console.log('connected')
    })

    socket.on("auth", (...args) => {
      console.log(args)
    });

  }
  */

  useEffect(() => {
    const options = {
      method: "GET",
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };

    const fetchData = async () => {
      {/* @ts-ignore */ }
      const res = await fetch(VERIFIER_ENDPOINT, options)
      console.log(res)
      const data = JSON.stringify(await res.json())
      console.log(data)
      setqrData(data)
    }

    fetchData().catch(console.error);
  }, [])

  const InfoRows = [
    {
      icon: <LinkIcon />,
      headingText: 'Connect your wallet',
      subHeadingText: 'Verify your wallet to start using the XMTP protocol',
      onClick: onConnect,
      disabled: disabled,
    }
  ]

  return (
    // The info panel is only shown in desktop layouts.
    <div className="hidden md:block m-auto w-[464px]">
      <div className="pb-6">
        <div className="text-xl text-n-600 font-semibold mb-1 text-center">
          Polygon ID Chat - Chat with your VCs
        </div>
        <div className="text-md text-n-300 text-center mb-2">
          Get started by scanning the QR code and authenticating with the polygon ID app
        </div>
        <div className="flex items-center justify-center">
          {/* @ts-ignore */}
          <QRCode value={qrData} />
        </div>
      </div>
      <div>
        {InfoRows.map((info, index) => {
          return (
            <InfoRow
              key={index}
              icon={info.icon}
              headingText={info.headingText}
              subHeadingText={info.subHeadingText}
              onClick={info.onClick}
              disabled={info.disabled}
            />
          )
        })}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-n-600 text-sm">
          xmtp-js v{packageJson.dependencies['@xmtp/xmtp-js'].substring(1)}
        </div>
        <a
          href="https://blog.xmtp.com/contact/"
          target="_blank"
          className="text-l-300 font-semibold text-md flex items-center"
          rel="noreferrer"
        >
          I need help <ArrowSmRightIcon className="h-5 fill-l-300" />
        </a>
      </div>
    </div>
  )
}

export default XmtpInfoPanel
