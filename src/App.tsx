import React, {useEffect, useState} from 'react';
import Papa from "papaparse"
import {ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis} from 'recharts';
import './styles.css'

import {
    Bar,
    BarChart,
    BarSeries,
    Gradient,
    GradientStop,
    GuideBar,
    RangeLines
} from "reaviz";

import * as lodash from 'lodash'
import {chain, fill, uniqBy} from "lodash";
import parse from 'date-fns/parse'

interface Gpus {
    "id": string,
    "title": string,
    "memory": string,
    "price": string,
    "date": string
}

function App() {

    const path = require("./CSV/SolotodoGpuList.csv");

    const [gpus, setGpus] = useState<Array<Gpus>>([])
    const [cards, setCards ] = useState<Array<any>>([])
    const [options, setOptions] = useState<Array<string>>([])
    const [scatter, setScatter] = useState<Array<any>>([])

    const [cardName,setCardName] = useState<string>('NVIDIA GeForce GTX 1050 Ti')

    useEffect(() => {

        Papa.parse(path, {
            header: true,
            download: true,
            complete: (Sdata) => {
                setGpus(Sdata.data.map((el: any, index) => ({
                    ...el,
                    id: index,
                    memory: `${el.memory}`.substring(0, 3).trim()
                })) as Array<Gpus>)

            }
        })

    }, [])

    useEffect(() => {
        if (gpus.length > 0) {
            const groupedByDates = chain(gpus)
                .groupBy(gpu=>gpu.date)
                .map((value, key) => ({
                    key:key,
                    data:value.filter(el=>el.title === cardName).map((el,index)=>({
                        key:`${el.title}-${index}`,
                        data:Number(el.price)
                    }))
                })).value()
            setCards(groupedByDates);
            //set labels
            const Labels:Array<string> = uniqBy(gpus,el=>el.title).map(el=>el.title)
            setOptions(Labels)

            const Crown = gpus.filter(el => el.title === cardName).map((gpu, index) => ({
                x: /*parse(gpu.date, 'd-M-yyyy', new Date())*/ gpu.date,
                y: Number(gpu.price),
                z: Number(gpu.memory),
            }));
            console.log(Crown)
            setScatter(Crown)


        }
    },[gpus,cardName])





    return (
        <div className="App" style={{
            margin: 50,
            alignContent: "center"
        }}>
            <div style={{
                margin: 50,
                alignContent: "flex-start"
            }}>
                <select name="Options" id="options2" onChange={(evt) => {
                    setCardName(evt.target.value)
                }}>
                    {
                        options.map((option, key) => (
                            <option key={key} value={option}>{option} </option>

                        ))
                    }

                </select>
            </div>

            {
                cards.length > 0 &&


                <BarChart

                    width={1000}
                    height={1000}
                    data={cards}
                    series={

                        <BarSeries
                            type="grouped"
                            bar={
                                <Bar gradient={<Gradient
                                    stops={[
                                        <GradientStop offset="5%" stopOpacity={0.1} key="start"/>,
                                        <GradientStop offset="90%" stopOpacity={0.7} key="stop"/>
                                    ]}
                                />} rangeLines={<RangeLines position="top" strokeWidth={3}/>} guide={<GuideBar/>}/>
                            }
                            colorScheme={"cybertron"}
                            padding={2}
                        />
                    }
                />
            }

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                    }}
                >
                    <CartesianGrid/>
                    <XAxis type="category" dataKey="x" name="Date" />
                    <YAxis type="number" dataKey="y" name="Money" unit="$"/>
                    <ZAxis type="number" dataKey="z" name="VRAM" unit="GB" />
                    <Tooltip cursor={{stroke: 'red', strokeWidth: 2}}/>
                    <Scatter name="GPU'S" data={scatter} fill="#8884d8"/>
                </ScatterChart>
            </ResponsiveContainer>


        </div>
    );
}

export default App;
