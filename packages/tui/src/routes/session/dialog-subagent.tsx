import { DialogSelect } from "../../ui/dialog-select"
import { useRoute } from "../../context/route"

export function DialogSubagent(props: { sessionID: string }) {
  const route = useRoute()

  return (
    <DialogSelect
      title="子智能体操作"
      options={[
        {
          title: "打开",
          value: "subagent.view",
          description: "该子智能体的会话",
          onSelect: (dialog) => {
            route.navigate({
              type: "session",
              sessionID: props.sessionID,
            })
            dialog.clear()
          },
        },
      ]}
    />
  )
}
