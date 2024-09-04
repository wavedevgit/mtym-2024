
const TutorialSection = () => {
  return (
    <div className="">
      <div className='drop-shadow-sm space-y-6 md:space-y-0 md:flex md:justify-around mb-12 text-center text-lg'>
        Etes-vous intéressé par nous rejoindre dans cette aventure?<br/>
        Nous vous avons préparé un tutoriel pour vous guider dans votre candidature et votre choix d&apos;équipe
      </div>

      <div
        className="drop-shadow-sm space-y-6 md:space-y-0 md:flex md:justify-around"
      >
        <iframe width="710" height="444" src="https://www.youtube.com/embed/bLxunPmuipQ?si=h58D0wPOWl11apqj" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
      </div>
    </div>
    
  )
}

export default TutorialSection
