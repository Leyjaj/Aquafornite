'use client'

import { useState, useEffect } from "react"

const premios = [
  { name: "Nada", value: 0 },
  { name: "5 Coins", value: 5 },
  { name: "10 Coins", value: 10 },
  { name: "20 Coins", value: 20 },
  { name: "50 Coins", value: 50 }
]

const COSTO_TIRO = 10

export default function Ruleta() {

  const [coins, setCoins] = useState(0)
  const [resultado, setResultado] = useState<string | null>(null)
  const [girando, setGirando] = useState(false)

  useEffect(() => {

    const savedCoins = localStorage.getItem("ruleta_coins")

    if (savedCoins) {
      setCoins(Number(savedCoins))
    } else {
      localStorage.setItem("ruleta_coins", "100") // monedas iniciales
      setCoins(100)
    }

  }, [])

  const guardarCoins = (value:number) => {
    setCoins(value)
    localStorage.setItem("ruleta_coins", value.toString())
  }

  const girar = () => {

    if (girando) return

    if (coins < COSTO_TIRO) {
      setResultado("No tienes monedas")
      return
    }

    setGirando(true)
    setResultado(null)

    guardarCoins(coins - COSTO_TIRO)

    setTimeout(() => {

      const index = Math.floor(Math.random() * premios.length)
      const premio = premios[index]

      const nuevasCoins = coins - COSTO_TIRO + premio.value

      guardarCoins(nuevasCoins)

      setResultado(`${premio.name} (+${premio.value})`)
      setGirando(false)

    }, 2000)

  }

  return (
    <div style={{textAlign:"center"}}>

      <h2>Ruleta</h2>

      <p>Coins: {coins}</p>
      <p>Costo por tiro: {COSTO_TIRO}</p>

      <button
        onClick={girar}
        disabled={girando}
        style={{
          padding:"10px 20px",
          fontSize:"16px",
          cursor:"pointer"
        }}
      >
        {girando ? "Girando..." : "Girar"}
      </button>

      {resultado && (
        <p style={{marginTop:"20px", fontSize:"20px"}}>
          Resultado: {resultado}
        </p>
      )}

    </div>
  )
}