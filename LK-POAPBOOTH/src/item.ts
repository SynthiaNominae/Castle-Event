import { CLEAR_UI, PoapBoothSystem, STOP_ANIMATE } from './PoapBoothSystem'
import { handlePoap, showMessage } from './PoapFunctions'

export type Props = {
  onClickText?: string
  eventName?: string
  owner?: string
  hoverText?: string
}

export var purchased = false
export var claimed = false
export var clicked = false
export var proxy = 'https://lkdcl.co/proxy/'

class Button implements IScript<Props> {
  active: Record<string, boolean> = {}
  idleAnim = new AnimationState('Idle_POAP', { looping: true })
  buyAnim = new AnimationState('Action_POAP', { looping: false })
  buttonAnim = new AnimationState('Button_Action', { looping: false })
  booths: string[] = []
  boothIds: number[] = []
  event: string
  eventsManager = new EventManager()
  host: Entity
  owner: string
  image?:string

  async init() {}

  animate(entity: Entity) {
    entity.getComponent(Animator).getClip('Action').stop()
    entity.getComponent(Animator).getClip('Action').play()

    let anim = entity.getComponent(Animator)

    anim.getClip('Idle_POAP').stop()
    anim.getClip('Action_POAP').stop()
    anim.getClip('Action_POAP').play()

    engine.addSystem(
      new PoapBoothSystem(4, STOP_ANIMATE, anim, this.eventsManager)
    )
    return
  }

  getPoap(entity: Entity, event: string) {
    this.animate(entity)
    handlePoap(event)
    return
  }

  async spawn(host: Entity, props: Props, channel: IChannel) {
    this.event = props.eventName
    var booth = new Entity(host.name + '-poapbooth-' +this.booths.length)
    booth.setParent(host)
    this.booths.push(host.name + '-poapbooth-' +this.booths.length)
    this.boothIds.push(this.booths.length)

    booth.addComponent(new GLTFShape('LK-POAPBOOTH/models/poap_dispenser.glb'))
    booth.addComponent(new Transform({}))

    /*
    var poapImage = new Entity()
    poapImage.addComponent(new PlaneShape())
    poapImage.addComponent(new Material())
    var image_url = this.image ? this.image : await getPOAPImage(this.event)
    poapImage.getComponent(Material).albedoTexture = new Texture(image_url)
    poapImage.addComponent(new Transform({
      position: new Vector3(0,2,0)
    }))
    poapImage.setParent(booth)
    */

    booth.addComponent(new Animator())
    booth.getComponent(Animator).addClip(this.idleAnim)
    booth.getComponent(Animator).addClip(this.buyAnim)

    var boothButton = new Entity(host.name + '-poapbutton')
    boothButton.addComponent(new GLTFShape('LK-POAPBOOTH/models/poap_button.glb'))
    boothButton.addComponent(new Transform({}))
    boothButton.setParent(host)

    this.idleAnim.play()

    boothButton.addComponent(
      new OnPointerDown(
        () => {
          if (!clicked) {
            this.getPoap(booth, props.eventName)
            channel.sendActions([
              {
                entityName: host.name,
                actionId: 'getPoap',
                values: { event: props.eventName, id:this.booths.length-1 },
              },
            ])
          } else {
            showMessage(
              'Already clicked. No POAP Spam please.',
              5,
              CLEAR_UI,
              null
            )
          }
        },
        {
          button: ActionButton.POINTER,
          hoverText: props.hoverText,
          distance: 2,
          showFeedback: true
        }
      )
    )

    // handle actions
    channel.handleAction<{ event: any }>('getPoap', ({ sender, values }) => {
      this.animate(booth)
      //if (sender === channel.id && values.id == this.booths.length-1) {
      //  this.getPoap(booth, values.event)
     // }
    })
  }
}

export default Button
