import { useState, useMemo, useRef } from "react";
import React from "react";
import Pusher from 'pusher-js'
import { Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js'

export const BarplotDatasetTransition = () => {

  const [selectedData, setSelectedData] = useState([]);

  const ws = useRef({})
  const wsChannel = useRef({})
  const allowFlow = useRef(true)
  const cusMinY = useRef(0)
  const cusMaxY = useRef(0)

  const checkNameInArray = (arr, value) => {
    if (arr.some(obj => 
      {
        if (obj.y === value){
          //console.log(obj.x)
          return true
        }
      }
      )) 
    { return true
    } else {
      return false
    }
    //return arr.some(obj => obj.x === value);
  };

  const calcCustomXY = (data) => {
    let values = []
    data.map((data) => {
      //console.log(data.y)
      values.push(data.x)
    })
    const maxNum = Math.max(...values);
    const minNum = Math.min(...values);
    const diff = maxNum - minNum;
    
    return [(minNum - diff), (maxNum)]
  }

  useMemo(() => {
    try{
        ws.current = new Pusher('marketspykey', {
            cluster: 'mt1',
            wsHost: "ws.marketspy.au",
            wsPort: 443,
            httpHost: "ws.marketspy.au",
            httpPort: 443,
            httpsPort: 443,
            forceTLS: false,
            encrypted: true,
            disableStats: true,
            enabledTransports: ['ws', 'wss'],
        })
    } catch (e) {
        console.log(e)
    }
    console.log("we are connected to pusher")
    wsChannel.current = ws.current.subscribe("SOL-USDT")
    console.log("we are subscribed to pusher")
    console.log(wsChannel.current)
    wsChannel.current.bind('update', (message) => {
      //if (allowFlow.current == true){
      setSelectedData(prevData => {
        //if (allowFlow.current == true){
          allowFlow.current = false
          const existing = [...prevData]

          if (existing.length >= 1){
            existing.map((_, index) => {
              if (existing[index].y == message.exchangeName) {
                existing[index].x = message.orderbookData.asks[0][0]
              }

              const checked = checkNameInArray(existing, message.exchangeName)

              if (checked == false) {
                console.log(`pushed ${message.orderbookData.asks[0][0]}`)

                existing.push({"y": message.exchangeName, "x": message.orderbookData.asks[0][0]})
              }
            })
          } else {
            console.log("pushd 2")
            existing.push({"y": message.exchangeName, "x": message.orderbookData.asks[0][0]})
          }

          let [min,max] = calcCustomXY(existing)
          //console.log(min)
          cusMinY.current = min
          cusMaxY.current = max

          return existing
        //}
      })
    })
  }, [])
  
  const data = {
    datasets: [{
      label: 'My First Dataset',
      data: selectedData,
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "red",
          font: {
            family: "Nunito",
            size: 12,
          },
        },
        min: cusMinY.current,
      },
      y: {
        ticks: {
          color: "red",
          font: {
            family: "Nunito",
            size: 12,
          },
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  ChartJS.register(CategoryScale)
  ChartJS.register(LinearScale)
  ChartJS.register(BarElement)

  return (
    <div>
      <div className="topbar">
        <img className="center" src="https://upload.wikimedia.org/wikipedia/commons/5/55/Olympic_rings_with_transparent_rims.svg" height={200}></img>
      </div>
      <div>
        <Bar className="modal" data={data} options={options}/>
      </div>
    </div>
  )
}