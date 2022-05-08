import { defineComponent, onMounted } from "vue";
import AutomoniaSheet from "./components/sheet/automonia-sheet";

export default defineComponent({
  setup() {

    onMounted(() => {
      let sheet = new AutomoniaSheet('sheet-container-id')
    })

    return () => (
      <div class="page-view">
        <div class="container-view" id="sheet-container-id" />
      </div>
    )
  }
})

