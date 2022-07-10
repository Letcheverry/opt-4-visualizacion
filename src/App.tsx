import React, {useEffect, useState} from 'react';
import Papa from "papaparse"
import {Bar, BarChart, BarSeries, Gradient, GradientStop, GuideBar, RangeLines, schemes} from "reaviz";
import {multiCategory} from "reaviz/dist/demo";
import * as lodash from 'lodash'
import {chain,uniqBy} from "lodash";


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

    const [cardName,setCardName] = useState<string>('NVIDIA GeForce GTX 1050 Ti')

    useEffect(() => {

        Papa.parse(path, {
            header: true,
            download: true,
            complete: (Sdata) => {
                setGpus(Sdata.data.map((el:any,index)=>({...el, id: index})) as Array<Gpus>)
            }
        })

    }, [])

    useEffect(()=>{
        if (gpus.length>0){
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
        }
    },[gpus,cardName])





    return (
        <div className="App" style={{
            margin:50
        }}>
            <div>
                <select name="Options" id="options2" onChange={(evt)=>{
                    setCardName(evt.target.value)
                }}>
                    {
                        options.map((option,key)=>(
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
                                        <GradientStop offset="5%" stopOpacity={0.1} key="start" />,
                                        <GradientStop offset="90%" stopOpacity={0.7} key="stop" />
                                    ]}
                                />} rangeLines={<RangeLines position="top" strokeWidth={3} />} guide={<GuideBar />} />
                            }
                            colorScheme={"cybertron"}
                            padding={2}
                        />
                    }
                />
            }



        </div>
    );
}

export default App;
