#!/usr/bin/python
import sys, getopt, json

def main(argv):
    load_file = ''
    # dataset = list()

	#Get command line args
    try:
        opts, args = getopt.getopt(argv,"h:f:",["load_file="])
    except getopt.GetoptError:
        print 'post-process.py -f <file>'
        sys.exit(2)
    for opt, arg in opts:
        if opt == '-h':
            print 'post-process.py -f <file>'
            sys.exit()
        elif opt in ("-f", "--file"):
            load_file = arg

    try:
        with open(load_file, 'r') as f:
            dataset = json.load(f)
    except:
        print 'error loading file {0}'.format(load_file)
        print 'post-process.py -f <file>'
        sys.exit(2)

    sequence = ["none", "FreezeTrajectory", "FreezeAroundCursor", "FreezeWholeScreen"]
    visual_cue = ["none", "ghost", "trail"]
    speed_density = ["low_low", "low_high", "high_low", "high_high"]
    nums = ["0", "1", "2", "3", "4"]

    newdata = dict()

    #  + seq + '_' + vis + '_' + sd + '_' + num
    # print len(dataset)
    newdata["workerId"] = dataset[0]['workerId']
    for seq in sequence:
        for vis in visual_cue:
            if vis != "none":
                break
            for sd in speed_density:
                total_red_dots_clicked = []
                total_red_dots_gone_offscreen = []
                total_wrong_thing_clicked = []
                total_nothing_clicked = []
                total_trial_time = []
                total_times_hit_shift_key = []
                total_times_hit_c_key = []
                total_blue_dot_answer_distances = []
                for num in nums:
                    id_string = '_' + seq + '_' + vis + '_' + sd + '_' + num
                    total_red_dots_clicked.append(int(dataset[0]['dots_clicked' + id_string]))
                    total_red_dots_gone_offscreen.append(int(dataset[0]['dots_missed' + id_string]))
                    total_wrong_thing_clicked.append(int(dataset[0]['errors' + id_string]))
                    total_nothing_clicked.append(int(dataset[0]['errors_clicked_nothing' + id_string]))
                    total_trial_time.append(float(dataset[0]['time' + id_string]))
                    total_times_hit_shift_key.append(int(dataset[0]['freezes_usesd' + id_string]))
                    total_times_hit_c_key.append(int(dataset[0]['clears_usesd' + id_string]))
                    total_blue_dot_answer_distances.append(abs(int(dataset[0]['distractors_answer' + id_string]) - int(dataset[0]['num_distractors' + id_string])))

                # total_red_dots_clicked.remove(max(total_red_dots_clicked))
                # total_red_dots_clicked.remove(min(total_red_dots_clicked))
                # total_red_dots_gone_offscreen.remove(max(total_red_dots_gone_offscreen))
                # total_red_dots_gone_offscreen.remove(min(total_red_dots_gone_offscreen))
                # total_wrong_thing_clicked.remove(max(total_wrong_thing_clicked))
                # total_wrong_thing_clicked.remove(min(total_wrong_thing_clicked))
                # total_nothing_clicked.remove(max(total_nothing_clicked))
                # total_nothing_clicked.remove(min(total_nothing_clicked))
                # total_trial_time.remove(max(total_trial_time))
                # total_trial_time.remove(min(total_trial_time))
                # total_times_hit_shift_key.remove(max(total_times_hit_shift_key))
                # total_times_hit_shift_key.remove(min(total_times_hit_shift_key))
                # total_times_hit_c_key.remove(max(total_times_hit_c_key))
                # total_times_hit_c_key.remove(min(total_times_hit_c_key))
                total_blue_dot_answer_distances.remove(max(total_blue_dot_answer_distances))
                total_blue_dot_answer_distances.remove(min(total_blue_dot_answer_distances))

                avg_red_dots_clicked = sum(total_red_dots_clicked) / len(total_red_dots_clicked)
                avg_red_dots_gone_offscreen = sum(total_red_dots_gone_offscreen) / len(total_red_dots_gone_offscreen)
                avg_wrong_thing_clicked = sum(total_wrong_thing_clicked) / len(total_wrong_thing_clicked)
                avg_nothing_clicked = sum(total_nothing_clicked) / len(total_nothing_clicked)
                avg_trial_time = sum(total_trial_time) / len(total_trial_time)
                avg_times_hit_shift_key = sum(total_times_hit_shift_key) / len(total_times_hit_shift_key)
                avg_times_hit_c_key = sum(total_times_hit_c_key) / len(total_times_hit_c_key)
                avg_blue_dot_answer_distances = sum(total_blue_dot_answer_distances) / len(total_blue_dot_answer_distances)

                id_string = '_' + seq + '_' + vis + '_' + sd
                newdata["avg_red_dots_clicked" + id_string] = avg_red_dots_clicked
                newdata["avg_red_dots_gone_offscreen" + id_string] = avg_red_dots_gone_offscreen
                newdata["avg_wrong_thing_clicked" + id_string] = avg_wrong_thing_clicked
                newdata["avg_nothing_clicked" + id_string] = avg_nothing_clicked
                newdata["avg_trial_time" + id_string] = avg_trial_time
                newdata["avg_times_hit_shift_key" + id_string] = avg_times_hit_shift_key
                newdata["avg_times_hit_c_key" + id_string] = avg_times_hit_c_key
                newdata["avg_blue_dot_answer_distances" + id_string] = avg_blue_dot_answer_distances

    try:
        with open('processed_' + load_file, 'w') as f:
                json.dump(newdata, f, indent=4, sort_keys=True)
    except:
        print 'error creating file {0}'.format(load_file)
        print 'post-process.py -f <file>'
        sys.exit(2)

if __name__ == "__main__":
   main(sys.argv[1:])
